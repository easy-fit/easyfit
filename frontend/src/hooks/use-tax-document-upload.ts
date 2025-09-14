import { useState, useCallback } from 'react';
import { SignedUrl } from '@/types/global';
import { UploadState, UploadProgress } from '@/types/upload';
import {
  TaxDocumentUploadService,
  TaxDocumentUploadItem,
  TaxDocumentBatchResult,
} from '@/lib/services/tax-document-upload.service';
import { useUploadTaxDocument } from '@/hooks/api/use-stores';
import { DocumentType } from '@/types/store';

export interface TaxDocumentFile {
  file: File;
  type: DocumentType;
}

interface UseTaxDocumentUploadOptions {
  storeId: string;
  onUploadComplete?: (result: TaxDocumentBatchResult) => void;
  onUploadError?: (error: string) => void;
  autoRetry?: boolean;
  maxRetries?: number;
}

interface UseTaxDocumentUploadReturn {
  uploadStates: UploadState[];
  isUploading: boolean;
  isCreatingSignedUrls: boolean;
  hasErrors: boolean;
  uploadDocuments: (documents: TaxDocumentFile[]) => Promise<TaxDocumentBatchResult>;
  retryFailedUploads: () => Promise<TaxDocumentBatchResult | null>;
  resetStates: () => void;
  validateFiles: (files: File[]) => { valid: boolean; errors: string[] };
}

export function useTaxDocumentUpload(options: UseTaxDocumentUploadOptions): UseTaxDocumentUploadReturn {
  const { storeId, onUploadComplete, onUploadError, autoRetry = false, maxRetries = 2 } = options;

  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadItems, setUploadItems] = useState<TaxDocumentUploadItem[]>([]);
  const [lastResult, setLastResult] = useState<TaxDocumentBatchResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const uploadTaxDocumentMutation = useUploadTaxDocument();
  const isCreatingSignedUrls = uploadTaxDocumentMutation.isPending;

  const hasErrors = uploadStates.some((state) => state.status === 'error');

  const updateUploadState = useCallback((index: number, state: UploadState) => {
    setUploadStates((prev) => {
      const newStates = [...prev];
      newStates[index] = state;
      return newStates;
    });
  }, []);

  const handleProgress = useCallback(
    (index: number, progress: UploadProgress) => {
      updateUploadState(index, {
        status: 'uploading',
        progress,
      });
    },
    [updateUploadState],
  );

  const validateFiles = useCallback((files: File[]) => {
    return TaxDocumentUploadService.validateFiles(files);
  }, []);

  const uploadDocuments = useCallback(
    async (documents: TaxDocumentFile[]): Promise<TaxDocumentBatchResult> => {
      try {
        setIsUploading(true);
        setRetryCount(0);

        // Validate files first
        const files = documents.map((doc) => doc.file);
        const validation = TaxDocumentUploadService.validateFiles(files);

        if (!validation.valid) {
          const error = validation.errors.join(', ');
          onUploadError?.(error);
          throw new Error(error);
        }

        // Initialize states for all documents
        const initialStates = documents.map(() => ({ status: 'idle' as const }));
        setUploadStates(initialStates);

        // Step 1: Create signed URLs for all documents
        const signedUrlPromises = documents.map(async (doc) => {
          const response = await uploadTaxDocumentMutation.mutateAsync({
            storeId,
            data: {
              fileName: doc.file.name,
              type: doc.type,
            },
          });

          return {
            signedUrl: {
              url: response.data.uploadInfo.url,
              key_img: response.data.uploadInfo.key,
            } as SignedUrl,
            documentType: doc.type,
            documentId: response.data.billing.taxDocuments[response.data.billing.taxDocuments.length - 1]?.id, // Get the ID of the newly created document
          };
        });

        // Wait for all signed URLs to be created
        const signedUrlResults = await Promise.all(signedUrlPromises);

        // Step 2: Create upload items
        const items = documents.map((doc, index) => ({
          file: doc.file,
          signedUrl: signedUrlResults[index].signedUrl.url,
          key: signedUrlResults[index].signedUrl.key_img,
          documentType: signedUrlResults[index].documentType,
          documentId: signedUrlResults[index].documentId,
          state: { status: 'idle' as const },
        })) as TaxDocumentUploadItem[];

        setUploadItems(items);

        // Step 3: Upload files to R2
        const result = await TaxDocumentUploadService.uploadBatch(items, handleProgress, updateUploadState);

        setLastResult(result);

        // Auto retry if enabled and there are failures
        const finalResult = result;
        if (autoRetry && !result.allSuccessful && retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1);
          // For tax documents, we don't retry failed uploads because we would need
          // to create new signed URLs. Instead, we just report the failure.
        }

        // Call completion callback
        onUploadComplete?.(finalResult);

        return finalResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        onUploadError?.(errorMessage);

        // Set all states to error
        setUploadStates((prev) =>
          prev.map(() => ({
            status: 'error' as const,
            error: errorMessage,
          })),
        );

        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [
      storeId,
      uploadTaxDocumentMutation,
      handleProgress,
      updateUploadState,
      onUploadComplete,
      onUploadError,
      autoRetry,
      maxRetries,
      retryCount,
    ],
  );

  const retryFailedUploads = useCallback(async (): Promise<TaxDocumentBatchResult | null> => {
    // For tax documents, retrying is complex because we would need to create new signed URLs
    // For now, we return null to indicate retry is not supported
    // In a production app, you might want to implement this by re-creating the failed uploads
    return null;
  }, []);

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
    isCreatingSignedUrls,
    hasErrors,
    uploadDocuments,
    retryFailedUploads,
    resetStates,
    validateFiles,
  };
}
