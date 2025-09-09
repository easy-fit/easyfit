'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTaxDocumentUpload, TaxDocumentFile } from '@/hooks/use-tax-document-upload';
import { TaxDocumentUploadService } from '@/lib/services/tax-document-upload.service';
import { DocumentType } from '@/types/store';
import { useEasyFitToast } from '@/hooks/use-toast';

interface TaxDocumentUploadProps {
  storeId: string;
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
}

interface FileWithType {
  file: File;
  type: DocumentType;
  id: string; // Unique identifier for React keys
}

const documentTypeOptions = {
  afip_certificate: 'Constancia AFIP',
  monotributo_receipt: 'Comprobante Monotributo',
  other: 'Otro Documento',
} as const;

export function TaxDocumentUpload({ 
  storeId, 
  onUploadSuccess, 
  onUploadError 
}: TaxDocumentUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithType[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useEasyFitToast();

  const {
    uploadStates,
    isUploading,
    isCreatingSignedUrls,
    hasErrors,
    uploadDocuments,
    resetStates,
    validateFiles,
  } = useTaxDocumentUpload({
    storeId,
    onUploadComplete: (result) => {
      if (result.allSuccessful) {
        toast.success(`${result.successCount} documento(s) subido(s) correctamente`);
        setSelectedFiles([]);
        resetStates();
        onUploadSuccess?.();
      } else {
        toast.uploadError({ message: `${result.failedCount} documento(s) fallaron al subir` });
        onUploadError?.(`${result.failedCount} files failed to upload`);
      }
    },
    onUploadError: (error) => {
      toast.uploadError({ message: error });
      onUploadError?.(error);
    },
  });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  }, []);

  const handleFileSelection = useCallback((files: File[]) => {
    // Validate files
    const validation = validateFiles(files);
    if (!validation.valid) {
      toast.validationError('archivo', validation.errors[0]);
      return;
    }

    // Convert files to FileWithType with default document type
    const filesWithType: FileWithType[] = files.map((file) => ({
      file,
      type: 'other' as DocumentType, // Default type
      id: `${file.name}-${file.size}-${Date.now()}`, // Unique ID
    }));

    setSelectedFiles(prev => [...prev, ...filesWithType]);
  }, [validateFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFileSelection(files);
    
    // Reset input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelection]);

  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const updateFileType = useCallback((fileId: string, newType: DocumentType) => {
    setSelectedFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, type: newType } : f)
    );
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.validationError('archivo', 'Por favor selecciona al menos un archivo');
      return;
    }

    // Convert to TaxDocumentFile format
    const documents: TaxDocumentFile[] = selectedFiles.map(f => ({
      file: f.file,
      type: f.type,
    }));

    try {
      await uploadDocuments(documents);
    } catch (error) {
      // Error handling is done in the hook's onUploadError callback
    }
  }, [selectedFiles, uploadDocuments]);

  const getUploadStateForFile = useCallback((index: number) => {
    return uploadStates[index] || { status: 'idle' as const };
  }, [uploadStates]);

  const canUpload = selectedFiles.length > 0 && !isUploading && !isCreatingSignedUrls;
  const isProcessing = isUploading || isCreatingSignedUrls;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-[#9EE493] bg-[#DBF7DC]/20'
            : 'border-gray-300 hover:border-[#9EE493] hover:bg-[#DBF7DC]/10'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[#20313A] mb-2">
          {dragActive ? 'Suelta los archivos aquí' : 'Subir Documentos Fiscales'}
        </h3>
        <p className="text-gray-600 mb-4">
          Arrastra y suelta tus archivos aquí o haz clic para seleccionar
        </p>
        <Button 
          variant="outline" 
          className="border-[#9EE493] hover:bg-[#DBF7DC] text-[#20313A] bg-transparent"
          type="button"
        >
          <Upload className="h-4 w-4 mr-2" />
          Seleccionar Archivos
        </Button>
        <p className="text-xs text-gray-500 mt-3">
          Formatos aceptados: PDF, JPG, PNG • Tamaño máximo: 5MB • Máximo 10 archivos
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-[#20313A]">
              Archivos Seleccionados ({selectedFiles.length})
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFiles([])}
              disabled={isProcessing}
              className="text-gray-600 hover:text-red-600"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar Todo
            </Button>
          </div>

          <div className="space-y-3">
            {selectedFiles.map((fileWithType, index) => {
              const uploadState = getUploadStateForFile(index);
              const progress = uploadState.progress?.percentage || 0;
              
              return (
                <div
                  key={fileWithType.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <FileText className="h-5 w-5 text-[#20313A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#20313A] truncate">
                        {fileWithType.file.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {TaxDocumentUploadService.formatFileSize(fileWithType.file.size)}
                      </p>
                      
                      {/* Progress bar */}
                      {uploadState.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            Subiendo... {progress}%
                          </p>
                        </div>
                      )}
                      
                      {/* Error message */}
                      {uploadState.status === 'error' && (
                        <p className="text-xs text-red-600 mt-1">
                          {uploadState.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Document Type Selector */}
                    <div className="min-w-0 max-w-[200px]">
                      <Select
                        value={fileWithType.type}
                        onValueChange={(value) => updateFileType(fileWithType.id, value as DocumentType)}
                        disabled={isProcessing}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(documentTypeOptions).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">
                      {uploadState.status === 'uploading' && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                      {uploadState.status === 'success' && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {uploadState.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      
                      {uploadState.status === 'idle' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeFile(fileWithType.id)}
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upload Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={!canUpload}
              className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-medium px-6"
            >
              {isCreatingSignedUrls && (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparando subida...
                </>
              )}
              {isUploading && !isCreatingSignedUrls && (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo archivos...
                </>
              )}
              {!isProcessing && (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir {selectedFiles.length} documento{selectedFiles.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}