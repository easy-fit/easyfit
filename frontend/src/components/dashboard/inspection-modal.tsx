'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { buildImageUrl } from '@/lib/utils/image-url';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Package } from 'lucide-react';
import Image from 'next/image';

interface InspectionItem {
  _id: string;
  variantId: {
    _id: string;
    size: string;
    color: string;
    images: Array<{
      key: string;
      altText: string;
      order: number;
      contentType: string;
      _id: string;
    }>;
  };
  product: {
    _id: string;
    title: string;
    category: string;
  };
  quantity: number;
  unitPrice: number;
  returnStatus: string;
}

interface InspectionData {
  orderId: string;
  returnedItems: InspectionItem[];
  message: string;
  timestamp: Date;
}

interface ItemInspectionResult {
  itemId: string;
  variantId: string;
  condition: 'returned' | 'returned_damaged';
  damageReason?: string;
}

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionData: InspectionData | null;
  storeId: string;
  onInspectionComplete: (result: {
    orderId: string;
    storeId: string;
    returnStatus: 'returned_ok' | 'returned_partial' | 'returned_damaged';
    damagedItems?: Array<{ variantId: string; reason: string }>;
  }) => void;
}

export function InspectionModal({
  isOpen,
  onClose,
  inspectionData,
  storeId,
  onInspectionComplete,
}: InspectionModalProps) {
  const [itemResults, setItemResults] = useState<Record<string, ItemInspectionResult>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleItemInspection = useCallback(
    (itemId: string, variantId: string, condition: 'returned' | 'returned_damaged', damageReason?: string) => {
      setItemResults((prev) => ({
        ...prev,
        [itemId]: {
          itemId,
          variantId,
          condition,
          damageReason: condition === 'returned_damaged' ? damageReason : undefined,
        },
      }));
    },
    [],
  );

  const handleBulkAction = useCallback(
    (action: 'all_good' | 'all_damaged') => {
      if (!inspectionData) return;

      const newResults: Record<string, ItemInspectionResult> = {};
      inspectionData.returnedItems.forEach((item) => {
        newResults[item._id] = {
          itemId: item._id,
          variantId: item.variantId._id,
          condition: action === 'all_good' ? 'returned' : 'returned_damaged',
          damageReason: action === 'all_damaged' ? 'Bulk marked as damaged' : undefined,
        };
      });
      setItemResults(newResults);
    },
    [inspectionData],
  );

  const handleSubmit = useCallback(async () => {
    if (!inspectionData) return;

    const allItemsInspected = inspectionData.returnedItems.every((item) => itemResults[item._id]);

    if (!allItemsInspected) {
      alert('Please inspect all returned items before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const results = Object.values(itemResults);
      const goodItems = results.filter((r) => r.condition === 'returned');
      const damagedItems = results.filter((r) => r.condition === 'returned_damaged');

      let returnStatus: 'returned_ok' | 'returned_partial' | 'returned_damaged';
      if (damagedItems.length === 0) {
        returnStatus = 'returned_ok';
      } else if (goodItems.length === 0) {
        returnStatus = 'returned_damaged';
      } else {
        returnStatus = 'returned_partial';
      }

      const inspectionResult = {
        orderId: inspectionData.orderId,
        storeId,
        returnStatus,
        damagedItems: damagedItems.map((item) => ({
          variantId: item.variantId,
          reason: item.damageReason || 'Item damaged during return',
        })),
      };

      onInspectionComplete(inspectionResult);
      onClose();
      setItemResults({});
    } catch (error) {
      console.error('Failed to submit inspection:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [inspectionData, itemResults, storeId, onInspectionComplete, onClose]);

  if (!inspectionData) return null;

  const totalItems = inspectionData.returnedItems.length;
  const inspectedItems = Object.keys(itemResults).length;
  const goodItems = Object.values(itemResults).filter((r) => r.condition === 'returned').length;
  const damagedItems = Object.values(itemResults).filter((r) => r.condition === 'returned_damaged').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#20313A]">Inspección de Devoluciones</DialogTitle>
          <p className="text-gray-600">Inspecciona los productos devueltos y marca su condición</p>
        </DialogHeader>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Items devueltos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{inspectedItems}</div>
              <p className="text-xs text-muted-foreground">Inspeccionados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{goodItems}</div>
              <p className="text-xs text-muted-foreground">Buen estado</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{damagedItems}</div>
              <p className="text-xs text-muted-foreground">Con problemas</p>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => handleBulkAction('all_good')}
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar todo como bueno
          </Button>
          <Button
            onClick={() => handleBulkAction('all_damaged')}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Marcar todo como dañado
          </Button>
        </div>

        {/* Items List */}
        <div className="space-y-4 mb-6">
          {inspectionData.returnedItems.map((item) => {
            const result = itemResults[item._id];
            const firstImage = item.variantId.images?.[0];

            return (
              <Card
                key={item._id}
                className={`transition-all ${
                  result?.condition === 'returned'
                    ? 'border-green-500 bg-green-50'
                    : result?.condition === 'returned_damaged'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {firstImage ? (
                        <Image
                          src={buildImageUrl(firstImage.key, 'small')}
                          alt={item.product.title}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-[#20313A] mb-2">{item.product.title}</h3>
                      <div className="flex gap-2 text-xs text-gray-600 mb-2">
                        <Badge variant="secondary">Talle: {item.variantId.size}</Badge>
                        <Badge variant="secondary">Color: {item.variantId.color}</Badge>
                        <Badge variant="secondary">Cantidad: {item.quantity}</Badge>
                      </div>
                      <p className="font-bold text-[#20313A]">${item.unitPrice.toLocaleString('es-AR')}</p>

                      {/* Inspection Actions */}
                      <div className="mt-4 space-y-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleItemInspection(item._id, item.variantId._id, 'returned')}
                            variant={result?.condition === 'returned' ? 'default' : 'outline'}
                            size="sm"
                            className={
                              result?.condition === 'returned'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'text-green-600 border-green-600 hover:bg-green-50'
                            }
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Buen estado
                          </Button>
                          <Button
                            onClick={() => handleItemInspection(item._id, item.variantId._id, 'returned_damaged')}
                            variant={result?.condition === 'returned_damaged' ? 'default' : 'outline'}
                            size="sm"
                            className={
                              result?.condition === 'returned_damaged'
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'text-red-600 border-red-600 hover:bg-red-50'
                            }
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Dañado
                          </Button>
                        </div>

                        {/* Damage Reason Input */}
                        {result?.condition === 'returned_damaged' && (
                          <Textarea
                            placeholder="Describe el daño o problema encontrado..."
                            value={result.damageReason || ''}
                            onChange={(e) => handleItemInspection(item._id, item.variantId._id, result.condition, e.target.value)}
                            className="mt-2"
                            rows={2}
                          />
                        )}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    {result && (
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            result.condition === 'returned' ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        >
                          {result.condition === 'returned' ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <XCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {inspectedItems < totalItems && (
              <>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse inline-block mr-2"></div>
                Inspecciona todos los items para continuar
              </>
            )}
            {inspectedItems === totalItems && (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full inline-block mr-2"></div>
                ¡Todos los items inspeccionados!
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={inspectedItems < totalItems || isSubmitting}
              className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar Inspección'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
