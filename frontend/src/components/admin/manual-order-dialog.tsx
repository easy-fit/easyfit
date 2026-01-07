'use client';

import { ManualOrderControl } from './manual-order-control';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OrderStatus } from '@/types/order';

interface ManualOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  currentStatus: OrderStatus;
  orderNumber?: string;
}

export function ManualOrderDialog({
  open,
  onOpenChange,
  orderId,
  currentStatus,
  orderNumber,
}: ManualOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Gestión Manual de Pedido</DialogTitle>
          <DialogDescription>
            {orderNumber ? `Pedido #${orderNumber}` : `ID: ${orderId.slice(-8)}`}
          </DialogDescription>
        </DialogHeader>
        <ManualOrderControl
          orderId={orderId}
          currentStatus={currentStatus}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
