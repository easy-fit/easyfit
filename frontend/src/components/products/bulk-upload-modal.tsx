'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, X, FileText } from 'lucide-react';
import { useEasyFitToast } from '@/hooks/use-toast';
import { useBulkUploadProducts } from '@/hooks/api/use-products';

interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
  storeId: string;
}

interface UploadResult {
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    productsCreated: number;
    variantsCreated: number;
    errors: number;
  };
  errors: Array<{
    row: number;
    field: string;
    error: string;
    data: any;
  }>;
  warnings: Array<{
    row: number;
    warning: string;
  }>;
}

export function BulkUploadModal({ open, onClose, storeId }: BulkUploadModalProps) {
  const toast = useEasyFitToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const bulkUploadMutation = useBulkUploadProducts();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Archivo inválido', {
          description: 'Solo se permiten archivos Excel (.xlsx, .xls)',
        });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Archivo muy grande', {
          description: 'El archivo debe ser menor a 10MB',
        });
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);
      formData.append('storeId', storeId);

      const result = await bulkUploadMutation.mutateAsync(formData);
      setUploadResult(result.data);

      toast.success('Carga completada', {
        description: `${result.data.summary.productsCreated} productos y ${result.data.summary.variantsCreated} variantes creados`,
      });
    } catch (error: any) {
      toast.error('Error en la carga', {
        description: error.message || 'No se pudo procesar el archivo Excel',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setIsUploading(false);
    onClose();
  };

  const downloadTemplate = () => {
    // Create a simple CSV template since we don't have xlsx library in frontend
    const headers = ['TITLE', 'DESCRIPTION', 'CATEGORY', 'STATUS', 'SIZE', 'COLOR', 'PRICE', 'STOCK', 'SKU'];
    const sampleData = [
      [
        'Calza Pescadora Manila Cocot',
        'Calza Pescadora Manila Cocot',
        'mujer.calzas',
        'published',
        '1',
        'Berry #C11F5B',
        '52000',
        '2',
        '1410131-BERRY-1',
      ],
      [
        'Calza Pescadora Manila Cocot',
        'Calza Pescadora Manila Cocot',
        'mujer.calzas',
        'published',
        '2',
        'Berry #C11F5B',
        '52000',
        '2',
        '1410131-BERRY-2',
      ],
      [
        'Pescadora Animal Jc Sin Costura Cocot',
        'Pescadora Animal Jc Sin Costura Cocot',
        'mujer.calzas',
        'published',
        '1',
        'Negro',
        '47700',
        '3',
        '1410148-24-1',
      ],
    ];

    const csvContent = [headers, ...sampleData].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_productos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Carga Masiva de Productos
          </DialogTitle>
          <DialogDescription>
            Subí un archivo Excel con productos y sus variantes para crear múltiples productos de una vez.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" />
                Plantilla de Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Descargá la plantilla con el formato correcto y datos de ejemplo.</p>
              <Button variant="outline" onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla
              </Button>
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Columnas requeridas:</strong> TITLE, DESCRIPTION, CATEGORY, STATUS, SIZE, COLOR, PRICE, STOCK,
                  SKU
                  <br />
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Subir Archivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FileSpreadsheet className="h-8 w-8 mx-auto text-green-600" />
                    <div className="text-sm">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Cambiar archivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <div className="text-sm">
                      <p className="font-medium">Seleccionar archivo Excel</p>
                      <p className="text-gray-500">Archivos .xlsx o .xls, máximo 10MB</p>
                    </div>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Seleccionar archivo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Procesando archivo...</span>
                    <span>Por favor espera</span>
                  </div>
                  <Progress value={100} className="animate-pulse" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {uploadResult.summary.errors > 0 ? (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  Resultados de la Carga
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{uploadResult.summary.productsCreated}</div>
                    <div className="text-sm text-gray-600">Productos creados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{uploadResult.summary.variantsCreated}</div>
                    <div className="text-sm text-gray-600">Variantes creadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{uploadResult.summary.validRows}</div>
                    <div className="text-sm text-gray-600">Filas válidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{uploadResult.summary.errors}</div>
                    <div className="text-sm text-gray-600">Errores</div>
                  </div>
                </div>

                {/* Errors */}
                {uploadResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Errores encontrados:</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {uploadResult.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Fila {error.row}:</strong> {error.error}
                            {error.data?.TITLE && (
                              <span className="block text-xs mt-1">Producto: {error.data.TITLE}</span>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">{selectedFile && `Archivo: ${selectedFile.name}`}</div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleClose}>
                {uploadResult ? 'Cerrar' : 'Cancelar'}
              </Button>
              {selectedFile && !uploadResult && (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                >
                  {isUploading ? 'Procesando...' : 'Subir y Procesar'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
