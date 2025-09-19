'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStore } from '@/contexts/store-context';
import { useEasyFitToast } from '@/hooks/use-toast';
import { useStoreProductMetrics, useStoreProducts } from '@/hooks/api/use-stores';
import { useDeleteProduct } from '@/hooks/api/use-products';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { StoreSidebar } from '@/components/dashboard/store-sidebar';
import { ProductMetricsCards } from '@/components/products/product-metrics-cards';
import { ProductFilters } from '@/components/products/product-filters';
import { ProductList } from '@/components/products/product-list';
import { BulkVariantEditModal } from '@/components/products/bulk-variant-edit-modal';
import { BulkProductStatusModal } from '@/components/products/bulk-product-status-modal';
import { BulkUploadModal } from '@/components/products/bulk-upload-modal';
import { Loader2 } from 'lucide-react';

export default function ProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { storeName, logoUrl, accessType } = useCurrentStore();
  const toast = useEasyFitToast();
  const router = useRouter();
  const { id } = React.use(params);

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [stockStatus, setStockStatus] = React.useState('');
  const [page, setPage] = React.useState(1);

  // Selection states
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);

  // Bulk variant edit modal state
  const [bulkEditModalOpen, setBulkEditModalOpen] = React.useState(false);
  const [bulkEditProductNames, setBulkEditProductNames] = React.useState<Record<string, string>>({});

  // Bulk status edit modal state
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = React.useState(false);
  const [bulkStatusProductNames, setBulkStatusProductNames] = React.useState<Record<string, string>>({});

  // Bulk upload modal state
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = React.useState(false);

  // Delete states
  const [productToDelete, setProductToDelete] = React.useState<{ id: string; title: string } | null>(null);
  const deleteProductMutation = useDeleteProduct(productToDelete?.id || '');

  // API calls
  const { data: metricsData, isLoading: metricsLoading } = useStoreProductMetrics(id);
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useStoreProducts(id, {
    search: searchQuery || undefined,
    category: category !== 'all' ? category : undefined,
    status: status !== 'all' ? status : undefined,
    stockStatus: stockStatus !== 'all' ? stockStatus : undefined,
    page,
    limit: 20,
  });

  const metrics = metricsData?.data;
  const products = productsData?.data?.products || [];
  const pagination = productsData?.pagination;

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedProducts(selected ? products.map((p) => p.id) : []);
  };

  const handleAddProduct = () => {
    router.push(`/dashboard/${id}/products/new`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/dashboard/${id}/products/${productId}/edit`);
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setProductToDelete({ id: productId, title: product.title });
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProductMutation.mutateAsync();
      toast.success('Producto eliminado', {
        description: 'El producto se eliminó correctamente.',
      });
      setProductToDelete(null);
      // Remove from selected products if it was selected
      setSelectedProducts((prev) => prev.filter((id) => id !== productToDelete.id));
    } catch (error) {
      toast.error('Error al eliminar producto', {
        description: 'No se pudo eliminar el producto. Intentá nuevamente.',
      });
    }
  };

  const cancelDelete = () => {
    setProductToDelete(null);
  };

  const handleViewProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product?.slug) {
      // Navigate to public product page
      router.push(`/${storeName?.toLowerCase()}/${product.slug}`);
    }
  };

  const handleBulkEditVariants = (productIds: string[], productNames: Record<string, string>) => {
    setBulkEditProductNames(productNames);
    setBulkEditModalOpen(true);
  };

  const closeBulkEditModal = () => {
    setBulkEditModalOpen(false);
    setBulkEditProductNames({});
    // Clear selection after bulk edit
    setSelectedProducts([]);
  };

  const handleBulkEditStatus = (productIds: string[], productNames: Record<string, string>) => {
    setBulkStatusProductNames(productNames);
    setBulkStatusModalOpen(true);
  };

  const closeBulkStatusModal = () => {
    setBulkStatusModalOpen(false);
    setBulkStatusProductNames({});
    // Clear selection after bulk edit
    setSelectedProducts([]);
  };

  const handleBulkUpload = () => {
    setBulkUploadModalOpen(true);
  };

  const closeBulkUploadModal = () => {
    setBulkUploadModalOpen(false);
  };

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, category, status, stockStatus]);

  // Show loading state only for initial load (when both metrics and products are loading)
  if (metricsLoading && !productsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarProvider>
          <StoreSidebar
            storeName={storeName}
            logoUrl={logoUrl}
            active="products"
            baseHref={`/dashboard/${id}`}
            userRole={accessType}
          />
          <SidebarInset>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#9EE493] mx-auto mb-4" />
                <p className="text-gray-600">Cargando productos...</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  // Show error state
  if (productsError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarProvider>
          <StoreSidebar
            storeName={storeName}
            logoUrl={logoUrl}
            active="products"
            baseHref={`/dashboard/${id}`}
            userRole={accessType}
          />
          <SidebarInset>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <p className="text-red-600">Error cargando productos</p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <StoreSidebar
          storeName={storeName}
          logoUrl={logoUrl}
          active="products"
          baseHref={`/dashboard/${id}`}
          userRole={accessType}
        />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <h1 className="text-base md:text-lg font-semibold text-[#20313A]">Productos</h1>
                <Badge variant="secondary" className="hidden md:inline-flex">
                  {products.length} productos
                </Badge>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 space-y-6">
            {/* Metrics */}
            {metrics ? (
              <ProductMetricsCards metrics={metrics} />
            ) : (
              <div className="animate-pulse">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <ProductFilters
              searchQuery={searchQuery}
              category={category}
              status={status}
              stockStatus={stockStatus}
              onSearchChange={setSearchQuery}
              onCategoryChange={setCategory}
              onStatusChange={setStatus}
              onStockStatusChange={setStockStatus}
              onAddProduct={handleAddProduct}
              onBulkUpload={handleBulkUpload}
            />

            {/* Product List */}
            <ProductList
              products={products}
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onSelectAll={handleSelectAll}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onViewProduct={handleViewProduct}
              onAddProduct={handleAddProduct}
              onBulkEditVariants={handleBulkEditVariants}
              onBulkEditStatus={handleBulkEditStatus}
              isLoading={productsLoading}
              pagination={pagination}
              onPageChange={setPage}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>

      {/* Bulk Variant Edit Modal */}
      <BulkVariantEditModal
        open={bulkEditModalOpen}
        onClose={closeBulkEditModal}
        selectedProductIds={selectedProducts}
        productNames={bulkEditProductNames}
      />

      {/* Bulk Product Status Modal */}
      <BulkProductStatusModal
        open={bulkStatusModalOpen}
        onClose={closeBulkStatusModal}
        selectedProductIds={selectedProducts}
        productNames={bulkStatusProductNames}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={bulkUploadModalOpen}
        onClose={closeBulkUploadModal}
        storeId={id}
      />

      {/* Delete Confirmation Dialog */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que querés eliminar el producto{' '}
              <span className="font-medium">{productToDelete.title}</span>?
            </p>
            <p className="text-amber-600 text-sm mb-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <strong>Advertencia:</strong> Se eliminarán todas las variantes asociadas a este producto. Esta acción no
              se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={cancelDelete} disabled={deleteProductMutation.isPending}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleteProductMutation.isPending}>
                {deleteProductMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
