import { mercadoPagoClient } from '../../lib/mercadopago.client';
import {
  CreatePaymentRequest,
  CreatePreferenceRequest,
  PaymentProcessingRequest,
} from '../../types/mercadoPago.types';
import { MERCADO_PAGO, ENV } from '../../config/env';
import { AppError } from '../../utils/appError';
import { User } from '../../types/user.types';
import { v4 as uuidv4 } from 'uuid';

export class MercadoPagoService {
  static async createPayment(paymentData: CreatePaymentRequest) {
    try {
      const idempotencyKey = uuidv4();

      const response = await mercadoPagoClient.payment.create({
        body: paymentData,
        requestOptions: {
          idempotencyKey,
        },
      });

      return response;
    } catch (error: any) {
      throw new AppError(
        `MercadoPago payment creation failed: ${error.message}`,
        400,
      );
    }
  }

  static async processPayment(
    paymentData: PaymentProcessingRequest,
    sessionId: string,
    cartItems: any[],
    userInfo?: any,
  ) {
    try {
      const capture =
        paymentData.selectedPaymentMethod === 'credit_card' ? false : true;

      const paymentRequest: CreatePaymentRequest = {
        transaction_amount: paymentData.transaction_amount,
        installments: paymentData.installments,
        capture,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id,
        token: paymentData.token,
        external_reference: sessionId,
        notification_url: MERCADO_PAGO.MP_WEBHOOK_URL,
        payer: {
          first_name: userInfo?.name || '',
          last_name: userInfo?.surname || '',
          email: paymentData.payer.email,
          identification: {
            type: paymentData.payer.identification.type,
            number: paymentData.payer.identification.number,
          },
        },
        description: `Payment for session ${sessionId}`,
        additional_info: {
          items: cartItems.map((item) => ({
            id: item.variantId,
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          payer: paymentData.additional_info?.payer,
        },
      };

      return await this.createPayment(paymentRequest);
    } catch (error: any) {
      throw new AppError(
        `MercadoPago payment processing failed: ${error.message}`,
        400,
      );
    }
  }

  static async getPayment(paymentId: string) {
    try {
      const response = await mercadoPagoClient.payment.get({
        id: paymentId,
      });

      return response;
    } catch (error: any) {
      throw new AppError(
        `MercadoPago payment retrieval failed: ${error.message}`,
        400,
      );
    }
  }

  static async capturePayment(paymentId: string, amount?: number) {
    try {
      const idempotencyKey = uuidv4();

      const captureData: any = {
        id: paymentId,
        requestOptions: {
          idempotencyKey,
        },
      };

      if (amount) {
        captureData.transaction_amount = amount;
      }

      const response = await mercadoPagoClient.payment.capture(captureData);
      return response;
    } catch (error: any) {
      throw new AppError(
        `MercadoPago payment capture failed: ${error.message}`,
        400,
      );
    }
  }

  static async cancelPayment(paymentId: string) {
    try {
      const idempotencyKey = uuidv4();

      const response = await mercadoPagoClient.payment.cancel({
        id: paymentId,
        requestOptions: {
          idempotencyKey,
        },
      });

      return response;
    } catch (error: any) {
      throw new AppError(
        `MercadoPago payment cancellation failed: ${error.message}`,
        400,
      );
    }
  }

  static async refundPayment(paymentId: string, amount?: number) {
    try {
      const idempotencyKey = uuidv4();

      const refundData: any = {
        payment_id: paymentId,
        requestOptions: {
          idempotencyKey,
        },
      };

      if (amount) {
        refundData.body = { amount };
      }

      const response = await mercadoPagoClient.paymentRefund.create(refundData);
      return response;
    } catch (error: any) {
      throw new AppError(
        `MercadoPago payment refund failed: ${error.message}`,
        400,
      );
    }
  }

  static async createPreference(
    user: User,
    data: any,
    sessionId: string,
    cost: number,
  ) {
    try {
      const preferenceData: CreatePreferenceRequest = {
        items: data,
        payer: {
          name: user.name,
          surname: user.surname,
          email: user.email,
          phone: {
            area_code: user.additionalInfo?.phone?.areaCode || '',
            number: user.additionalInfo?.phone?.number || '',
          },
          identification: {
            type: user.additionalInfo?.dniType || '',
            number: user.additionalInfo?.dni || '',
          },
          address: {
            zip_code: user.address?.formatted.postalCode || '',
            street_name: user.address?.formatted.street || '',
            street_number: user.address?.formatted.streetNumber || '',
          },
        },
        back_urls: {
          success: 'google.com',
          failure: `${ENV.FRONTEND_URL}/checkout/failure?session=${sessionId}`,
          pending: `${ENV.FRONTEND_URL}/checkout/pending?session=${sessionId}`,
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_methods: [{ id: 'pagofacil' }, { id: 'rapipago' }],
          excluded_payment_types: [{ id: 'ticket' }],
          installments: 1,
        },
        shipments: {
          mode: 'custom',
          cost: cost,
          free_shipping: false,
        },
        notification_url: MERCADO_PAGO.MP_WEBHOOK_URL,
        external_reference: `session-${sessionId}`,
      };

      const response = await mercadoPagoClient.preference.create({
        body: preferenceData,
      });

      return response.id;
    } catch (error: any) {
      throw new AppError(
        `MercadoPago preference creation failed: ${error.message}`,
        400,
      );
    }
  }
}