'use client';

import { useState } from 'react';
import { AlertTriangle, Package, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface ProductVariant {
  _id: string;
  size: string;
  color: string;
  stock: number;
}

interface ProductDeleteModalProps {
  product: {
    _id: string;
    title: string;
    variants?: ProductVariant[];
  } | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (force: boolean) => void;
}

export function ProductDeleteModal({
  product,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: ProductDeleteModalProps) {
  const [forceDelete, setForceDelete] = useState(false);

  if (!isOpen || !product) return null;

  const hasVariants = product.variants && product.variants.length > 0;
  const variantCount = product.variants?.length || 0;

  const handleConfirm = () => {
    onConfirm(hasVariants ? forceDelete : false);
  };

  const handleClose = () => {
    setForceDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#20313A]">Eliminar Producto</h3>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Product Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-[#20313A]">{product.title}</p>
                <p className="text-sm text-gray-600">ID: {product._id}</p>
              </div>
            </div>
          </div>

          {/* Variants Warning */}
          {hasVariants && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-red-900">
                      Este producto tiene {variantCount} variante{variantCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-red-700">
                      Al eliminar el producto, también se eliminarán todas sus variantes de forma permanente.
                    </p>
                  </div>

                  {/* Variants List */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-900">Variantes que se eliminarán:</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {product.variants.map((variant) => (
                          <div
                            key={variant._id}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {variant.size}
                              </Badge>
                              <span className="text-sm text-gray-700">{variant.color}</span>
                            </div>
                            <span className="text-xs text-gray-500">Stock: {variant.stock}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirmation Checkbox */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded border border-red-200">
                    <Checkbox
                      id="force-delete"
                      checked={forceDelete}
                      onCheckedChange={(checked) => setForceDelete(checked as boolean)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor="force-delete"
                      className="text-sm text-red-900 leading-relaxed cursor-pointer"
                    >
                      Entiendo que se eliminarán <strong>{variantCount} variante{variantCount !== 1 ? 's' : ''}</strong> junto
                      con el producto y esta acción no se puede deshacer.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simple confirmation for products without variants */}
          {!hasVariants && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ¿Estás seguro de que querés eliminar{' '}
                <span className="font-medium">&quot;{product.title}&quot;</span>?
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || (hasVariants && !forceDelete)}
            className="min-w-[120px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {hasVariants ? 'Eliminar Todo' : 'Eliminar'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}