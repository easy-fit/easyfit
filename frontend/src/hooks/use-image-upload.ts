import { useState, useCallback } from 'react';
import { SignedUrl } from '@/types/global';
import { 
  FileUploadItem, 
  BatchUploadResult, 
  UploadState, 
  UploadProgress 
} from '@/types/upload';
import { ImageUploadService } from '@/lib/services/image-upload.service';

interface UseImageUploadOptions {
  onUploadComplete?: (result: BatchUploadResult) => void;
  onUploadError?: (error: string) => void;
  autoRetry?: boolean;
  maxRetries?: number;
}

interface UseImageUploadReturn {
  uploadStates: UploadState[];
  isUploading: boolean;
  hasErrors: boolean;
  uploadImages: (files: File[], signedUrls: SignedUrl[]) => Promise<BatchUploadResult>;
  retryFailedUploads: () => Promise<BatchUploadResult | null>;
  resetStates: () => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    onUploadComplete,
    onUploadError,
    autoRetry = false,
    maxRetries = 2
  } = options;

  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);
  const [lastResult, setLastResult] = useState<BatchUploadResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const hasErrors = uploadStates.some(state => state.status === 'error');

  const updateUploadState = useCallback((index: number, state: UploadState) => {
    setUploadStates(prev => {
      const newStates = [...prev];
      newStates[index] = state;
      return newStates;
    });
  }, []);

  const handleProgress = useCallback((index: number, progress: UploadProgress) => {
    updateUploadState(index, { 
      status: 'uploading', 
      progress 
    });
  }, [updateUploadState]);

  const uploadImages = useCallback(async (
    files: File[], 
    signedUrls: SignedUrl[]
  ): Promise<BatchUploadResult> => {
    try {
      setIsUploading(true);
      setRetryCount(0);

      // Create upload items
      const items = ImageUploadService.createUploadItems(files, signedUrls);
      setUploadItems(items);

      // Initialize states
      const initialStates = items.map(() => ({ status: 'idle' as const }));
      setUploadStates(initialStates);

      // Perform upload
      const result = await ImageUploadService.uploadBatch(
        items,
        handleProgress,
        updateUploadState
      );

      setLastResult(result);

      // Auto retry if enabled and there are failures
      let finalResult = result;
      if (autoRetry && !result.allSuccessful && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        finalResult = await ImageUploadService.retryFailedUploads(
          items,
          result,
          handleProgress,
          updateUploadState
        );
        setLastResult(finalResult);
      }

      // Call completion callback
      onUploadComplete?.(finalResult);

      return finalResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
      
      // Set all states to error
      setUploadStates(prev => prev.map(() => ({ 
        status: 'error' as const, 
        error: errorMessage 
      })));

      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [
    handleProgress, 
    updateUploadState, 
    onUploadComplete, 
    onUploadError, 
    autoRetry, 
    maxRetries, 
    retryCount
  ]);

  const retryFailedUploads = useCallback(async (): Promise<BatchUploadResult | null> => {
    if (!lastResult || !uploadItems.length || retryCount >= maxRetries) {
      return null;
    }

    try {
      setIsUploading(true);
      setRetryCount(prev => prev + 1);

      const result = await ImageUploadService.retryFailedUploads(
        uploadItems,
        lastResult,
        handleProgress,
        updateUploadState
      );

      setLastResult(result);
      onUploadComplete?.(result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Retry failed';
      onUploadError?.(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [
    lastResult, 
    uploadItems, 
    retryCount, 
    maxRetries, 
    handleProgress, 
    updateUploadState, 
    onUploadComplete, 
    onUploadError
  ]);

  const resetStates = useCallback(() => {
    setUploadStates([]);
    setIsUploading(false);
    setUploadItems([]);
    setLastResult(null);
    setRetryCount(0);
  }, []);

  return {
    uploadStates,
    isUploading,
    hasErrors,
    uploadImages,
    retryFailedUploads,
    resetStates
  };
}