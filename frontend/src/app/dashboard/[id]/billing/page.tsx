'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  useStoreBilling,
  useUpdateStoreBilling,
  useUploadTaxDocument,
  useDeleteTaxDocument,
} from '@/hooks/api/use-stores';
import { useCurrentStore } from '@/contexts/store-context';
import { useEasyFitToast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StoreSidebar } from '@/components/dashboard/store-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  FileText,
  Building2,
  Save,
  Hash,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Trash2,
} from 'lucide-react';

import { TaxDocument, BankingInfo, FiscalInfo, TaxStatus, DocumentType } from '@/types/store';
import { TaxDocumentUpload } from '@/components/billing/TaxDocumentUpload';
import { DocumentViewer } from '@/components/ui/document-viewer';
import { buildTaxDocumentUrl } from '@/lib/utils/image-url';

const taxStatusOptions: Record<TaxStatus, string> = {
  monotributista: 'Monotributista',
  responsable_inscripto: 'Responsable Inscripto',
  exento: 'Exento',
};

const taxCategoryOptions = {
  categoria_a: 'Categoría A',
  categoria_b: 'Categoría B',
  categoria_c: 'Categoría C',
  categoria_d: 'Categoría D',
  categoria_e: 'Categoría E',
  categoria_f: 'Categoría F',
  categoria_g: 'Categoría G',
  categoria_h: 'Categoría H',
};

const documentTypeLabels: Record<DocumentType, string> = {
  afip_certificate: 'Constancia AFIP',
  monotributo_receipt: 'Comprobante Monotributo',
  other: 'Otro',
};

export default function BillingPage() {
  const params = useParams();
  const storeId = params.id as string;
  const { storeName, logoUrl, accessType } = useCurrentStore();

  const { data: billingResponse, isLoading: billingLoading, refetch: refetchBilling } = useStoreBilling(storeId);
  const updateBillingMutation = useUpdateStoreBilling();
  const deleteDocumentMutation = useDeleteTaxDocument();
  const toast = useEasyFitToast();

  const [formData, setFormData] = useState<{
    fiscalInfo: Partial<FiscalInfo>;
    bankingInfo: Partial<BankingInfo>;
  }>({ 
    fiscalInfo: {
      cuit: '',
      businessName: '',
      taxStatus: 'monotributista',
      taxCategory: ''
    }, 
    bankingInfo: {
      accountType: 'cbu',
      cbu: '',
      bankName: '',
      accountHolder: '',
      alias: ''
    } 
  });

  const [documentViewer, setDocumentViewer] = useState<{
    isOpen: boolean;
    document: TaxDocument | null;
  }>({ isOpen: false, document: null });

  const billingData = billingResponse?.data;
  console.log('Billing Data:', billingData);
  const isLoading = billingLoading || updateBillingMutation.isPending;

  useEffect(() => {
    if (billingData) {
      setFormData({
        fiscalInfo: {
          cuit: billingData.fiscalInfo?.cuit || '',
          businessName: billingData.fiscalInfo?.businessName || '',
          taxStatus: billingData.fiscalInfo?.taxStatus || 'monotributista',
          taxCategory: billingData.fiscalInfo?.taxCategory || ''
        },
        bankingInfo: {
          accountType: billingData.bankingInfo?.accountType || 'cbu',
          cbu: billingData.bankingInfo?.cbu || '',
          bankName: billingData.bankingInfo?.bankName || '',
          accountHolder: billingData.bankingInfo?.accountHolder || '',
          alias: billingData.bankingInfo?.alias || ''
        },
      });
    }
  }, [billingData]);

  const handleSave = async () => {
    try {
      await updateBillingMutation.mutateAsync({
        storeId,
        data: formData,
      });
      toast.success('Información de facturación actualizada correctamente');
    } catch (error) {
      toast.smartError(error, 'Error al actualizar la información de facturación');
    }
  };

  const updateFiscalField = (field: keyof FiscalInfo, value: any) => {
    setFormData((prev) => ({
      ...prev,
      fiscalInfo: { ...prev.fiscalInfo, [field]: value },
    }));
  };

  const updateBankingField = (field: keyof BankingInfo, value: any) => {
    setFormData((prev) => ({
      ...prev,
      bankingInfo: { ...prev.bankingInfo, [field]: value },
    }));
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocumentMutation.mutateAsync({ storeId, documentId });
      toast.success('Documento eliminado correctamente');
    } catch (error) {
      toast.smartError(error, 'Error al eliminar el documento');
    }
  };

  const handleViewDocument = (document: TaxDocument) => {
    setDocumentViewer({ isOpen: true, document });
  };

  const handleCloseViewer = () => {
    setDocumentViewer({ isOpen: false, document: null });
  };

  const handleDownloadDocument = (taxDocument: TaxDocument) => {
    const url = buildTaxDocumentUrl(taxDocument.fileKey);
    const link = document.createElement('a');
    link.href = url;
    link.download = taxDocument.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <StoreSidebar
        storeName={storeName!}
        logoUrl={logoUrl}
        active="billing"
        baseHref={`/dashboard/${storeId}`}
        userRole={accessType}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 flex-1">
            <CreditCard className="h-5 w-5 text-[#20313A]" />
            <h1 className="text-base md:text-lg font-semibold text-[#20313A]">Facturación y Pagos</h1>
            <Badge
              variant="secondary"
              className={`border ${
                billingData?.status === 'accepted'
                  ? 'bg-[#DBF7DC] text-[#20313A] border-[#9EE493]'
                  : billingData?.status === 'rejected'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
              }`}
            >
              {billingData?.status === 'accepted'
                ? 'Aprobado'
                : billingData?.status === 'pending'
                ? 'Pendiente'
                : billingData?.status === 'rejected' || billingData?.status === null
                ? 'Rechazado'
                : 'No Enviado'}
            </Badge>
          </div>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A] font-medium px-6 py-2 h-10 shadow-sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </header>

        <main className="flex-1 space-y-8 p-4 md:p-6 bg-gray-50">
          {/* Tax Information */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-[#20313A] text-xl">
                <div className="p-2 bg-[#DBF7DC] rounded-lg">
                  <Hash className="h-5 w-5 text-[#20313A]" />
                </div>
                Información Fiscal
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configura tu situación fiscal y datos tributarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="cuit" className="text-sm font-medium text-[#20313A] flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    CUIT
                  </Label>
                  <Input
                    id="cuit"
                    value={formData.fiscalInfo.cuit || ''}
                    onChange={(e) => updateFiscalField('cuit', e.target.value)}
                    placeholder="20-12345678-9"
                    className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="businessName" className="text-sm font-medium text-[#20313A] flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Razón Social
                  </Label>
                  <Input
                    id="businessName"
                    value={formData.fiscalInfo.businessName || ''}
                    onChange={(e) => updateFiscalField('businessName', e.target.value)}
                    placeholder="Nombre de la empresa"
                    className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="taxStatus" className="text-sm font-medium text-[#20313A]">
                    Condición Fiscal
                  </Label>
                  <Select
                    value={formData.fiscalInfo.taxStatus}
                    onValueChange={(value) => updateFiscalField('taxStatus', value as TaxStatus)}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]">
                      <SelectValue placeholder="Monotributo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(taxStatusOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.fiscalInfo.taxStatus === 'monotributista' && (
                  <div className="space-y-3">
                    <Label htmlFor="taxCategory" className="text-sm font-medium text-[#20313A]">
                      Categoría Monotributo
                    </Label>
                    <Select
                      value={formData.fiscalInfo.taxCategory}
                      onValueChange={(value) => updateFiscalField('taxCategory', value)}
                    >
                      <SelectTrigger className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]">
                        <SelectValue placeholder="Categoria A" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(taxCategoryOptions).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tax Documents */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-[#20313A] text-xl">
                <div className="p-2 bg-[#DBF7DC] rounded-lg">
                  <FileText className="h-5 w-5 text-[#20313A]" />
                </div>
                Documentos Fiscales
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sube los documentos requeridos para validar tu situación fiscal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <TaxDocumentUpload
                storeId={storeId}
                onUploadSuccess={() => {
                  refetchBilling();
                }}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                }}
              />

              {/* Document List */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-[#20313A]">Documentos Subidos</h4>
                {billingData?.taxDocuments && billingData.taxDocuments.length > 0 ? (
                  billingData.taxDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <FileText className="h-5 w-5 text-[#20313A]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#20313A]">{doc.name}</p>
                        <p className="text-sm text-gray-600">
                          {documentTypeLabels[doc.type as DocumentType]} • Subido el{' '}
                          {new Date(doc.uploadedAt).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(doc.status)}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDocument(doc)}
                          title="Ver documento"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownloadDocument(doc)}
                          title="Descargar documento"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No hay documentos subidos aún</p>
                    <p className="text-xs text-gray-400">Subí tus documentos fiscales para completar la validación</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-[#20313A] text-xl">
                <div className="p-2 bg-[#DBF7DC] rounded-lg">
                  <Building2 className="h-5 w-5 text-[#20313A]" />
                </div>
                Información Bancaria
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configura tu cuenta bancaria para recibir los pagos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="bankName" className="text-sm font-medium text-[#20313A]">
                    Banco
                  </Label>
                  <Input
                    id="bankName"
                    value={formData.bankingInfo.bankName || ''}
                    onChange={(e) => updateBankingField('bankName', e.target.value)}
                    placeholder="Nombre del banco"
                    className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="accountHolder" className="text-sm font-medium text-[#20313A]">
                    Titular de la Cuenta
                  </Label>
                  <Input
                    id="accountHolder"
                    value={formData.bankingInfo.accountHolder || ''}
                    onChange={(e) => updateBankingField('accountHolder', e.target.value)}
                    placeholder="Nombre del titular"
                    className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="cbu" className="text-sm font-medium text-[#20313A]">
                    CBU
                  </Label>
                  <Input
                    id="cbu"
                    value={formData.bankingInfo.cbu || ''}
                    onChange={(e) => updateBankingField('cbu', e.target.value)}
                    placeholder="0000000000000000000000"
                    className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="alias" className="text-sm font-medium text-[#20313A]">
                    Alias <span className="text-gray-400 text-xs">(Opcional)</span>
                  </Label>
                  <Input
                    id="alias"
                    value={formData.bankingInfo.alias || ''}
                    onChange={(e) => updateBankingField('alias', e.target.value)}
                    placeholder="MI.ALIAS.BANCARIO"
                    className="h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      {/* Document Viewer */}
      {documentViewer.document && (
        <DocumentViewer
          isOpen={documentViewer.isOpen}
          onClose={handleCloseViewer}
          documentName={documentViewer.document.name}
          fileKey={documentViewer.document.fileKey}
          documentType={documentViewer.document.type as any}
        />
      )}
    </SidebarProvider>
  );
}
