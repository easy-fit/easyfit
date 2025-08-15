import { SignedUrl } from '@/types/global';
import { 
  FileUploadItem, 
  ImageUploadResult, 
  BatchUploadResult, 
  UploadProgress, 
  UploadState 
} from '@/types/upload';

export class ImageUploadService {
  /**
   * Upload a single file to R2 using a signed URL
   */
  static async uploadFile(
    file: File,
    signedUrl: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ImageUploadResult> {
    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              success: true,
              key: signedUrl.split('?')[0].split('/').pop() || 'unknown'
            });
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed due to network error'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was aborted'));
        });

        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      return {
        success: false,
        key: '',
        error: errorMessage
      };
    }
  }

  /**
   * Upload multiple files concurrently with progress tracking
   */
  static async uploadBatch(
    uploadItems: FileUploadItem[],
    onItemProgress?: (index: number, progress: UploadProgress) => void,
    onItemStateChange?: (index: number, state: UploadState) => void
  ): Promise<BatchUploadResult> {
    const uploadPromises = uploadItems.map(async (item, index) => {
      try {
        // Set uploading state
        onItemStateChange?.(index, { status: 'uploading' });

        const result = await this.uploadFile(
          item.file,
          item.signedUrl,
          (progress) => {
            onItemProgress?.(index, progress);
            onItemStateChange?.(index, { 
              status: 'uploading', 
              progress 
            });
          }
        );

        // Set final state based on result
        if (result.success) {
          onItemStateChange?.(index, { status: 'success' });
          return {
            success: true,
            key: item.key
          };
        } else {
          onItemStateChange?.(index, { 
            status: 'error', 
            error: result.error 
          });
          return {
            success: false,
            key: item.key,
            error: result.error
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        onItemStateChange?.(index, { 
          status: 'error', 
          error: errorMessage 
        });
        return {
          success: false,
          key: item.key,
          error: errorMessage
        };
      }
    });

    const results = await Promise.allSettled(uploadPromises);
    
    const finalResults: ImageUploadResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          key: uploadItems[index].key,
          error: result.reason?.message || 'Upload failed'
        };
      }
    });

    const successCount = finalResults.filter(r => r.success).length;
    const failedCount = finalResults.length - successCount;

    return {
      results: finalResults,
      allSuccessful: failedCount === 0,
      failedCount,
      successCount
    };
  }

  /**
   * Map signed URLs to upload items for variant images
   */
  static createUploadItems(
    files: File[],
    signedUrls: SignedUrl[]
  ): FileUploadItem[] {
    if (files.length !== signedUrls.length) {
      throw new Error('Files and signed URLs count mismatch');
    }

    return files.map((file, index) => ({
      file,
      signedUrl: signedUrls[index].url,
      key: signedUrls[index].key_img,
      state: { status: 'idle' as const }
    }));
  }

  /**
   * Retry failed uploads
   */
  static async retryFailedUploads(
    originalItems: FileUploadItem[],
    batchResult: BatchUploadResult,
    onItemProgress?: (index: number, progress: UploadProgress) => void,
    onItemStateChange?: (index: number, state: UploadState) => void
  ): Promise<BatchUploadResult> {
    const failedIndices = batchResult.results
      .map((result, index) => result.success ? -1 : index)
      .filter(index => index !== -1);

    if (failedIndices.length === 0) {
      return batchResult;
    }

    const retryItems = failedIndices.map(index => originalItems[index]);
    const retryResult = await this.uploadBatch(
      retryItems, 
      (retryIndex, progress) => {
        const originalIndex = failedIndices[retryIndex];
        onItemProgress?.(originalIndex, progress);
      },
      (retryIndex, state) => {
        const originalIndex = failedIndices[retryIndex];
        onItemStateChange?.(originalIndex, state);
      }
    );

    // Merge results
    const mergedResults = [...batchResult.results];
    retryResult.results.forEach((result, retryIndex) => {
      const originalIndex = failedIndices[retryIndex];
      mergedResults[originalIndex] = result;
    });

    const successCount = mergedResults.filter(r => r.success).length;
    const failedCount = mergedResults.length - successCount;

    return {
      results: mergedResults,
      allSuccessful: failedCount === 0,
      failedCount,
      successCount
    };
  }
}