import { OrderService } from './order.service';
import { OrderItemService } from './orderItem.service';
import { PaymentService } from './payment/payment.service';
import { MercadoPagoService } from './payment/mercadoPago.service';
import { ErrorHandlingService } from './errorHandling.service';
import { AppError } from '../utils/appError';
import { TRY_PERIOD_PENALTY_BY_SECOND } from '../config/tryPeriod';
import { EmailService } from './email.service';

export interface PaymentSettlementData {
  orderId: string;
  finalStatus: 'purchased' | 'stolen' | 'item_based';
  tryPeriodDuration?: number;
}

export interface SettlementResult {
  success: boolean;
  settlementType: 'full_capture' | 'partial_capture' | 'full_refund' | 'partial_refund' | 'penalty_applied';
  capturedAmount?: number;
  refundedAmount?: number;
  penaltyAmount?: number;
  mercadoPagoResponse?: any;
  message: string;
}

export class PaymentSettlementService {
  static async processPaymentSettlement(data: PaymentSettlementData): Promise<SettlementResult> {
    try {
      return await ErrorHandlingService.executeWithRetry({
        operation: async () => {
          return this.executeSettlement(data);
        },
        maxRetries: 2,
        delay: 5000,
        backoff: true,
        context: {
          orderId: data.orderId,
          operation: 'payment_settlement',
          stage: data.finalStatus,
          originalError: new Error('Settlement operation'),
          metadata: { finalStatus: data.finalStatus },
        },
      });
    } catch (error: any) {
      ErrorHandlingService.handlePaymentSettlementError(data.orderId, data.finalStatus, error);
      throw error;
    }
  }

  private static async executeSettlement(data: PaymentSettlementData): Promise<SettlementResult> {
    const { orderId, finalStatus } = data;

    const order = await OrderService.getOrderById(orderId);

    const payment = await PaymentService.getInternalPaymentByOrderId(orderId);

    // Process settlement based on final status
    switch (finalStatus) {
      case 'purchased':
        return this.handleFullPurchase(order, payment);

      case 'stolen':
        return this.handleStolenOrder(order, payment);

      case 'item_based':
        return this.handleItemBasedSettlement(order, payment);

      default:
        throw new AppError('Invalid final status for payment settlement', 400);
    }
  }

  private static async handleFullPurchase(order: any, payment: any): Promise<SettlementResult> {
    try {
      let mercadoPagoResponse;

      if (payment.type === 'hold') {
        mercadoPagoResponse = await MercadoPagoService.capturePayment(payment.externalId);
      }

      await PaymentService.updateInternalPayment(payment._id.toString(), {
        status: 'captured',
        capturedAmount: order.total,
        settledAt: new Date(),
      });

      return {
        success: true,
        settlementType: 'full_capture',
        capturedAmount: order.total,
        mercadoPagoResponse,
        message: 'Full purchase amount captured successfully',
      };
    } catch (error: any) {
      console.error('Full purchase settlement failed:', error);

      // Send critical email alert for settlement failures
      try {
        await EmailService.sendCriticalPaymentAlert({
          orderId: order._id.toString(),
          operation: 'payment_settlement_full_purchase',
          error: error,
          severity: 'critical',
          metadata: {
            settlementType: 'full_capture',
            orderTotal: order.total,
            paymentType: payment.type
          },
        });
      } catch (emailError) {
        console.error('Failed to send settlement failure alert email:', emailError);
      }

      return {
        success: false,
        settlementType: 'full_capture',
        message: `Settlement failed: ${error.message}`,
      };
    }
  }

  private static async handleItemBasedSettlement(order: any, payment: any): Promise<SettlementResult> {
    try {
      console.log(`\n=== PAYMENT SETTLEMENT ANALYSIS for Order ${order._id} ===`);
      
      const orderItems = await OrderItemService.getOrderItemsByOrderId(order._id.toString());
      console.log(`Total order items: ${orderItems.length}`);

      // Calculate amounts based on individual item return statuses
      const keptItems = orderItems.filter((item: any) => item.returnStatus === 'kept');
      const damagedItems = orderItems.filter((item: any) => item.returnStatus === 'returned_damaged');
      const successfullyReturnedItems = orderItems.filter((item: any) => item.returnStatus === 'returned');

      console.log(`\nItem breakdown by status:`);
      console.log(`- Kept items: ${keptItems.length} (customer chose to purchase)`);
      console.log(`- Damaged items: ${damagedItems.length} (returned but damaged - customer pays)`);
      console.log(`- Successfully returned items: ${successfullyReturnedItems.length} (returned in good condition - customer gets refund)`);

      // Log individual items for debugging
      keptItems.forEach((item: any, index: number) => {
        console.log(`  Kept ${index + 1}: ${item.variantId?.productId?.title || 'Unknown'} - $${item.unitPrice} x ${item.quantity}`);
      });
      damagedItems.forEach((item: any, index: number) => {
        console.log(`  Damaged ${index + 1}: ${item.variantId?.productId?.title || 'Unknown'} - $${item.unitPrice} x ${item.quantity} (customer pays)`);
      });
      successfullyReturnedItems.forEach((item: any, index: number) => {
        console.log(`  Returned ${index + 1}: ${item.variantId?.productId?.title || 'Unknown'} - $${item.unitPrice} x ${item.quantity} (refund)`);
      });

      const keptAmount = this.calculateItemsAmountFromObjects(keptItems);
      const damagedAmount = this.calculateItemsAmountFromObjects(damagedItems);
      const returnedAmount = this.calculateItemsAmountFromObjects(successfullyReturnedItems);

      console.log(`\nAmount breakdown:`);
      console.log(`- Kept items amount: $${keptAmount}`);
      console.log(`- Damaged items amount: $${damagedAmount} (charged to customer)`);
      console.log(`- Returned items amount: $${returnedAmount} (refunded to customer)`);
      console.log(`- Shipping cost: $${order.shipping.cost}`);

      // Customer pays for kept + damaged items + shipping
      const totalCaptureAmount = keptAmount + damagedAmount + order.shipping.cost;
      const refundAmount = returnedAmount;

      console.log(`\nFINAL SETTLEMENT:`);
      console.log(`- Customer will be charged: $${totalCaptureAmount} (kept: $${keptAmount} + damaged: $${damagedAmount} + shipping: $${order.shipping.cost})`);
      console.log(`- Customer will be refunded: $${refundAmount} (good returns)`);
      console.log(`- Net amount to customer: $${totalCaptureAmount - refundAmount}`);
      console.log(`=====================================\n`);

      let mercadoPagoResponse;
      let settlementType: 'full_capture' | 'partial_capture' | 'partial_refund';
      let paymentStatus: string;

      if (refundAmount === 0) {
        // No refunds needed - capture full amount
        settlementType = 'full_capture';
        paymentStatus = 'captured';

        if (payment.type === 'hold') {
          mercadoPagoResponse = await MercadoPagoService.capturePayment(payment.externalId, totalCaptureAmount);
        }
      } else {
        // Partial settlement needed
        settlementType = 'partial_capture';
        paymentStatus = 'partially_settled';

        if (payment.type === 'hold') {
          mercadoPagoResponse = await MercadoPagoService.capturePayment(payment.externalId, totalCaptureAmount);
        } else {
          mercadoPagoResponse = await MercadoPagoService.refundPayment(payment.externalId, refundAmount);
        }
      }

      await PaymentService.updateInternalPayment(payment._id.toString(), {
        status: paymentStatus,
        capturedAmount: totalCaptureAmount,
        refundedAmount: refundAmount,
        settledAt: new Date(),
      });

      const message = `Settlement: ${keptItems.length} kept, ${damagedItems.length} damaged, ${successfullyReturnedItems.length} returned`;

      return {
        success: true,
        settlementType,
        capturedAmount: totalCaptureAmount,
        refundedAmount: refundAmount,
        mercadoPagoResponse,
        message,
      };
    } catch (error: any) {
      console.error('Item-based settlement failed:', error);

      // Send critical email alert for item-based settlement failures
      try {
        await EmailService.sendCriticalPaymentAlert({
          orderId: order._id.toString(),
          operation: 'payment_settlement_item_based',
          error: error,
          severity: 'critical',
          metadata: {
            settlementType: 'partial_capture',
            orderTotal: order.total,
            paymentType: payment.type
          },
        });
      } catch (emailError) {
        console.error('Failed to send item-based settlement failure alert email:', emailError);
      }

      return {
        success: false,
        settlementType: 'partial_capture',
        message: `Settlement failed: ${error.message}`,
      };
    }
  }

  private static async handleStolenOrder(order: any, payment: any): Promise<SettlementResult> {
    try {
      const captureAmount = order.total;

      let mercadoPagoResponse;

      if (payment.type === 'hold') {
        mercadoPagoResponse = await MercadoPagoService.capturePayment(payment.externalId, captureAmount);
      }

      await PaymentService.updateInternalPayment(payment._id.toString(), {
        status: 'captured',
        capturedAmount: captureAmount,
        settledAt: new Date(),
      });

      return {
        success: true,
        settlementType: 'penalty_applied',
        capturedAmount: captureAmount,
        mercadoPagoResponse,
        message: 'Stolen order penalty applied - full amount charged',
      };
    } catch (error: any) {
      console.error('Stolen order settlement failed:', error);

      // Send critical email alert for stolen order settlement failures
      try {
        await EmailService.sendCriticalPaymentAlert({
          orderId: order._id.toString(),
          operation: 'payment_settlement_stolen_order',
          error: error,
          severity: 'critical',
          metadata: {
            settlementType: 'penalty_applied',
            orderTotal: order.total,
            paymentType: payment.type
          },
        });
      } catch (emailError) {
        console.error('Failed to send stolen order settlement failure alert email:', emailError);
      }

      return {
        success: false,
        settlementType: 'penalty_applied',
        message: `Settlement failed: ${error.message}`,
      };
    }
  }

  private static calculateTryPeriodPenalty(durationSeconds: number): number {
    return durationSeconds * TRY_PERIOD_PENALTY_BY_SECOND;
  }

  private static calculateItemsAmount(items: Array<{ quantity: number; unitPrice: number }>): number {
    return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  }

  private static calculateItemsAmountFromObjects(items: Array<{ quantity: number; unitPrice: number }>): number {
    return items.reduce((total, item) => total + (item.quantity || 1) * item.unitPrice, 0);
  }
}
