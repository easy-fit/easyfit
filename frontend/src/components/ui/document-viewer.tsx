'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ExternalLink } from 'lucide-react';
import { buildTaxDocumentUrl } from '@/lib/utils/image-url';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  fileKey: string;
  documentType: 'afip_certificate' | 'monotributo_receipt' | 'other';
}

export function DocumentViewer({
  isOpen,
  onClose,
  documentName,
  fileKey,
  documentType,
}: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const documentUrl = buildTaxDocumentUrl(fileKey);
  const isPdf = fileKey.toLowerCase().endsWith('.pdf');

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    window.open(documentUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {documentName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir en nueva pestaña
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 h-[calc(90vh-140px)] overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 mb-4">Error al cargar el documento</p>
                <Button onClick={handleOpenExternal} variant="outline">
                  Abrir en nueva pestaña
                </Button>
              </div>
            </div>
          )}

          {isPdf ? (
            <iframe
              src={documentUrl}
              className="w-full h-full border rounded-lg"
              onLoad={handleLoad}
              onError={handleError}
              style={{ display: isLoading || error ? 'none' : 'block' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <img
                src={documentUrl}
                alt={documentName}
                className="max-w-full max-h-full object-contain rounded-lg"
                onLoad={handleLoad}
                onError={handleError}
                style={{ display: isLoading || error ? 'none' : 'block' }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}