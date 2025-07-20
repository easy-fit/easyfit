import { OrderService } from './order.service';
import { PaymentService } from './payment/payment.service';
import { MercadoPagoService } from './payment/mercadoPago.service';
import { ErrorHandlingService } from './errorHandling.service';
import { AppError } from '../utils/appError';
import { TRY_PERIOD_PENALTY_BY_SECOND } from '../config/tryPeriod';

export interface PaymentSettlementData {
  orderId: string;
  finalStatus: 'purchased' | 'returned_ok' | 'returned_partial' | 'returned_damaged' | 'stolen';
  keptItems?: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
  }>;
  returnedItems?: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
  }>;
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

  /**
   * Execute the actual settlement logic
   */
  private static async executeSettlement(data: PaymentSettlementData): Promise<SettlementResult> {
    const { orderId, finalStatus } = data;

    const order = await OrderService.getOrderById(orderId);

    const payment = await PaymentService.getInternalPaymentByOrderId(orderId);

    // Process settlement based on final status
    switch (finalStatus) {
      case 'purchased':
        return this.handleFullPurchase(order, payment);

      case 'returned_ok':
        return this.handleFullReturn(order, payment);

      case 'returned_partial':
        return this.handlePartialReturn(order, payment, data);

      case 'returned_damaged':
        return this.handleDamagedReturn(order, payment);

      case 'stolen':
        return this.handleStolenOrder(order, payment);

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
      return {
        success: false,
        settlementType: 'full_capture',
        message: `Settlement failed: ${error.message}`,
      };
    }
  }

  private static async handleFullReturn(order: any, payment: any): Promise<SettlementResult> {
    try {
      const refundAmount = order.total - order.shipping.cost;
      const capturedAmount = order.shipping.cost; // Customer pays shipping

      let mercadoPagoResponse;

      if (payment.type === 'hold') {
        mercadoPagoResponse = await MercadoPagoService.capturePayment(payment.externalId, capturedAmount);
      } else {
        mercadoPagoResponse = await MercadoPagoService.refundPayment(payment.externalId, refundAmount);
      }

      await PaymentService.updateInternalPayment(payment._id.toString(), {
        status: 'partially_refunded',
        capturedAmount: capturedAmount,
        refundedAmount: refundAmount,
        settledAt: new Date(),
      });

      return {
        success: true,
        settlementType: 'partial_refund',
        capturedAmount: capturedAmount,
        refundedAmount: refundAmount,
        mercadoPagoResponse,
        message: 'Full return processed - shipping cost retained',
      };
    } catch (error: any) {
      console.error('Full return settlement failed:', error);
      return {
        success: false,
        settlementType: 'partial_refund',
        message: `Settlement failed: ${error.message}`,
      };
    }
  }

  private static async handlePartialReturn(
    order: any,
    payment: any,
    data: PaymentSettlementData,
  ): Promise<SettlementResult> {
    try {
      const keptAmount = this.calculateItemsAmount(data.keptItems || []);
      const returnedAmount = this.calculateItemsAmount(data.returnedItems || []);

      const totalKeptAmount = keptAmount + order.shipping.cost;

      let mercadoPagoResponse;

      if (payment.type === 'hold') {
        // Capture only the amount for kept items + shipping
        mercadoPagoResponse = await MercadoPagoService.capturePayment(payment.externalId, totalKeptAmount);
      } else {
        // Refund the amount for returned items
        mercadoPagoResponse = await MercadoPagoService.refundPayment(payment.externalId, returnedAmount);
      }

      await PaymentService.updateInternalPayment(payment._id.toString(), {
        status: 'partially_settled',
        capturedAmount: totalKeptAmount,
        refundedAmount: returnedAmount,
        settledAt: new Date(),
      });

      return {
        success: true,
        settlementType: 'partial_capture',
        capturedAmount: totalKeptAmount,
        refundedAmount: returnedAmount,
        mercadoPagoResponse,
        message: 'Partial settlement processed successfully',
      };
    } catch (error: any) {
      console.error('Partial return settlement failed:', error);
      return {
        success: false,
        settlementType: 'partial_capture',
        message: `Settlement failed: ${error.message}`,
      };
    }
  }

  private static async handleDamagedReturn(order: any, payment: any): Promise<SettlementResult> {
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
        message: 'Damaged items penalty applied - full amount charged',
      };
    } catch (error: any) {
      console.error('Damaged return settlement failed:', error);
      return {
        success: false,
        settlementType: 'penalty_applied',
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
}
