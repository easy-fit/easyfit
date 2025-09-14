import { SignedUrl } from '@/types/global';
import { 
  FileUploadItem, 
  ImageUploadResult, 
  BatchUploadResult, 
  UploadProgress, 
  UploadState 
} from '@/types/upload';

export interface TaxDocumentUploadItem extends Omit<FileUploadItem, 'file'> {
  file: File;
  documentType: 'afip_certificate' | 'monotributo_receipt' | 'other';
  documentId?: string; // Will be set after successful upload metadata creation
}

export interface TaxDocumentUploadResult extends ImageUploadResult {
  documentId?: string;
  documentType?: string;
}

export interface TaxDocumentBatchResult extends Omit<BatchUploadResult, 'results'> {
  results: TaxDocumentUploadResult[];
}

export class TaxDocumentUploadService {
  // Valid file types and extensions
  private static readonly ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
  private static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png'
  ];
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly MAX_FILES = 10;

  /**
   * Validate a single file for tax document upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `El archivo "${file.name}" es demasiado grande. Máximo permitido: 5MB`
      };
    }

    // Check file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `El archivo "${file.name}" no es un tipo válido. Solo se permiten: PDF, JPG, PNG`
      };
    }

    // Check file extension as additional validation
    const extension = file.name.toLowerCase().split('.').pop();
    if (!extension || !this.ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `El archivo "${file.name}" no tiene una extensión válida. Solo se permiten: PDF, JPG, PNG`
      };
    }

    return { valid: true };
  }

  /**
   * Validate multiple files for batch upload
   */
  static validateFiles(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (files.length === 0) {
      errors.push('No se han seleccionado archivos');
    }

    if (files.length > this.MAX_FILES) {
      errors.push(`Máximo ${this.MAX_FILES} archivos permitidos`);
    }

    // Validate each file
    files.forEach((file, index) => {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        errors.push(validation.error || `Error en archivo ${index + 1}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Upload a single tax document file to R2 using a signed URL
   */
  static async uploadFile(
    file: File,
    signedUrl: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<TaxDocumentUploadResult> {
    try {
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          key: '',
          error: validation.error || 'File validation failed'
        };
      }

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
   * Upload multiple tax documents concurrently with progress tracking
   */
  static async uploadBatch(
    uploadItems: TaxDocumentUploadItem[],
    onItemProgress?: (index: number, progress: UploadProgress) => void,
    onItemStateChange?: (index: number, state: UploadState) => void
  ): Promise<TaxDocumentBatchResult> {
    // Validate all files before starting upload
    const files = uploadItems.map(item => item.file);
    const validation = this.validateFiles(files);
    
    if (!validation.valid) {
      // Set error state for all items
      uploadItems.forEach((_, index) => {
        onItemStateChange?.(index, { 
          status: 'error', 
          error: validation.errors[0] || 'Validation failed'
        });
      });
      
      return {
        results: uploadItems.map(() => ({
          success: false,
          key: '',
          error: validation.errors[0] || 'Validation failed'
        })),
        allSuccessful: false,
        failedCount: uploadItems.length,
        successCount: 0
      };
    }

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
            key: item.key,
            documentId: item.documentId,
            documentType: item.documentType
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
    
    const finalResults: TaxDocumentUploadResult[] = results.map((result, index) => {
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
   * Create upload items for tax documents with document types
   */
  static createUploadItems(
    files: File[],
    signedUrls: SignedUrl[],
    documentTypes: ('afip_certificate' | 'monotributo_receipt' | 'other')[]
  ): TaxDocumentUploadItem[] {
    if (files.length !== signedUrls.length || files.length !== documentTypes.length) {
      throw new Error('Files, signed URLs, and document types count mismatch');
    }

    return files.map((file, index) => ({
      file,
      signedUrl: signedUrls[index].url,
      key: signedUrls[index].key_img,
      documentType: documentTypes[index],
      state: { status: 'idle' as const }
    }));
  }

  /**
   * Get file icon based on file type
   */
  static getFileIcon(file: File): string {
    const type = file.type.toLowerCase();
    const extension = file.name.toLowerCase().split('.').pop();

    if (type === 'application/pdf' || extension === 'pdf') {
      return '📄';
    }
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(extension || '')) {
      return '🖼️';
    }
    return '📄'; // Default
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get readable document type name
   */
  static getDocumentTypeName(type: string): string {
    const typeNames = {
      'afip_certificate': 'Constancia AFIP',
      'monotributo_receipt': 'Comprobante Monotributo', 
      'other': 'Otro documento'
    };
    return typeNames[type as keyof typeof typeNames] || 'Documento';
  }
}