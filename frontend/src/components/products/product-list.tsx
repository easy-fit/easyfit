'use client';

import { MoreHorizontal, Edit, Trash2, Copy, Eye, Package, Plus, Settings } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { buildImageUrl } from '@/lib/utils/image-url';
import { CategoryUtils } from '@/lib/utils/categoryUtils';

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  variants: number;
  stock: {
    total: number;
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
  };
  price: {
    min: number;
    max: number;
  };
  status: 'published' | 'draft' | 'draft';
  createdAt: string;
}

interface ProductListProps {
  products: Product[];
  selectedProducts: string[];
  onSelectProduct: (productId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onEditProduct: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onViewProduct: (productId: string) => void;
  onAddProduct?: () => void;
  onBulkEditVariants?: (productIds: string[], productNames: Record<string, string>) => void;
  isLoading?: boolean;
  pagination?: {
    current: number;
    total: number;
    count: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange?: (page: number) => void;
}

const getStockStatusColor = (status: string) => {
  switch (status) {
    case 'in-stock':
      return 'bg-green-100 text-green-800';
    case 'low-stock':
      return 'bg-orange-100 text-orange-800';
    case 'out-of-stock':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryName = (category: string) => {
  if (!category) return 'Sin categoría';

  // Check if it's a valid category key from our configuration
  if (CategoryUtils.isValidCategory(category)) {
    return CategoryUtils.getCategoryDisplayName(category);
  }

  // If it's not a valid category key, return as is (fallback)
  return category;
};

const getStockStatusText = (status: string) => {
  switch (status) {
    case 'in-stock':
      return 'En Stock';
    case 'low-stock':
      return 'Stock Bajo';
    case 'out-of-stock':
      return 'Sin Stock';
    default:
      return status;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'published':
      return 'Publicado';
    case 'draft':
      return 'Borrador';
    case 'deleted':
      return 'Archivado';
    default:
      return status;
  }
};

export function ProductList({
  products,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  onEditProduct,
  onDeleteProduct,
  onViewProduct,
  onAddProduct,
  onBulkEditVariants,
  isLoading = false,
  pagination,
  onPageChange,
}: ProductListProps) {
  const allSelected = products.length > 0 && selectedProducts.length === products.length;
  const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length;

  const handleBulkEditVariants = () => {
    if (!onBulkEditVariants || selectedProducts.length === 0) return;

    const productNames = selectedProducts.reduce((acc, productId) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        acc[productId] = product.name;
      }
      return acc;
    }, {} as Record<string, string>);

    onBulkEditVariants(selectedProducts, productNames);
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el instanceof HTMLInputElement) el.indeterminate = someSelected;
                }}
                onCheckedChange={onSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedProducts.length > 0 ? `${selectedProducts.length} seleccionados` : 'Productos'}
              </span>
            </div>
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2">
                {onBulkEditVariants && (
                  <Button variant="outline" size="sm" onClick={handleBulkEditVariants}>
                    <Settings className="h-4 w-4 mr-2" />
                    Editar variantes
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  Más acciones
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Product List */}
        <div className="divide-y">
          {products.map((product) => (
            <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={() => onSelectProduct(product.id)}
                />

                {/* Product Image */}
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={buildImageUrl(product.image)}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-[#20313A] truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">{getCategoryName(product.category)}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-600">{product.variants} variantes</span>
                      </div>
                    </div>

                    {/* Price - centered */}
                    <div className="px-4">
                      <div className="font-medium text-[#20313A] text-center">
                        {product.price.min === product.price.max
                          ? `$${product.price.min}`
                          : `$${product.price.min} - $${product.price.max}`}
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className={getStatusColor(product.status)}>
                      {getStatusText(product.status)}
                    </Badge>
                    <Badge variant="secondary" className={getStockStatusColor(product.stock.status)}>
                      {getStockStatusText(product.stock.status)} ({product.stock.total})
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewProduct(product.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver producto
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditProduct(product.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteProduct(product.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600 mb-4">Comenzá agregando tu primer producto a la tienda.</p>
            <Button className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]" onClick={onAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
