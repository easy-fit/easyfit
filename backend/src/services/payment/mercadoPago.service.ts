import { mercadoPagoClient } from '../../lib/mercadopago.client';
import { CreatePaymentRequest, PaymentProcessingRequest } from '../../types/mercadoPago.types';
import { MERCADO_PAGO, ENV } from '../../config/env';
import { AppError } from '../../utils/appError';
import { User } from '../../types/user.types';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email.service';

export class MercadoPagoService {
  static async createPayment(paymentData: CreatePaymentRequest) {
    try {
      const idempotencyKey = uuidv4();
      const issuerId = Number(paymentData.issuer_id);
      if (isNaN(issuerId)) {
        throw new Error(`Invalid issuer_id: ${paymentData.issuer_id}`);
      }

      const response = await mercadoPagoClient.payment.create({
        body: { ...paymentData, issuer_id: issuerId },
        requestOptions: {
          idempotencyKey,
        },
      });

      return response;
    } catch (error: any) {
      // Send critical email alert for payment creation failures
      try {
        await EmailService.sendCriticalPaymentAlert({
          operation: 'payment_creation',
          error: error,
          severity: 'critical',
          metadata: {
            paymentData: {
              transaction_amount: paymentData.transaction_amount,
              payment_method_id: paymentData.payment_method_id,
              issuer_id: paymentData.issuer_id
            }
          },
        });
      } catch (emailError) {
        console.error('Failed to send payment creation alert email:', emailError);
      }

      throw new AppError(`MercadoPago payment creation failed: ${error.message}`, 400);
    }
  }

  static async processPayment(
    paymentData: PaymentProcessingRequest,
    sessionId: string,
    cartItems: any[],
    userInfo?: any,
  ) {
    try {
      const capture = paymentData.selectedPaymentMethod === 'credit_card' ? false : true;

      const payerInfo = paymentData.additional_info?.payer;
      if (payerInfo?.address?.street_number) {
         payerInfo.address.street_number = String(payerInfo.address.street_number);
      }

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
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
          })),
          payer: payerInfo,
        },
      };

      return await this.createPayment(paymentRequest);
    } catch (error: any) {
      throw new AppError(`MercadoPago payment processing failed: ${error.message}`, 400);
    }
  }

  static async getPayment(paymentId: string) {
    try {
      const response = await mercadoPagoClient.payment.get({
        id: paymentId,
      });

      return response;
    } catch (error: any) {
      throw new AppError(`MercadoPago payment retrieval failed: ${error.message}`, 400);
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
      // Send critical email alert for payment capture failures
      try {
        await EmailService.sendCriticalPaymentAlert({
          operation: 'payment_capture',
          error: error,
          severity: 'critical',
          metadata: {
            paymentId,
            captureAmount: amount
          },
        });
      } catch (emailError) {
        console.error('Failed to send payment capture alert email:', emailError);
      }

      throw new AppError(`MercadoPago payment capture failed: ${error.message}`, 400);
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
      // Send critical email alert for payment cancellation failures
      try {
        await EmailService.sendCriticalPaymentAlert({
          operation: 'payment_cancellation',
          error: error,
          severity: 'critical',
          metadata: {
            paymentId
          },
        });
      } catch (emailError) {
        console.error('Failed to send payment cancellation alert email:', emailError);
      }

      throw new AppError(`MercadoPago payment cancellation failed: ${error.message}`, 400);
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
      // Send critical email alert for payment refund failures
      try {
        await EmailService.sendCriticalPaymentAlert({
          operation: 'payment_refund',
          error: error,
          severity: 'critical',
          metadata: {
            paymentId,
            refundAmount: amount
          },
        });
      } catch (emailError) {
        console.error('Failed to send payment refund alert email:', emailError);
      }

      throw new AppError(`MercadoPago payment refund failed: ${error.message}`, 400);
    }
  }

  static async createPreference(user: User, data: any, sessionId: string, cost: number) {
    try {
      const payerData: any = {
        email: user.email,
      };

      if (user.name) payerData.name = user.name;
      if (user.surname) payerData.surname = user.surname;

      if (user.additionalInfo?.phone?.number) {
        payerData.phone = {
          number: user.additionalInfo.phone.number,
        };
        if (user.additionalInfo.phone.areaCode) {
          payerData.phone.area_code = user.additionalInfo.phone.areaCode;
        }
      }

      if (user.additionalInfo?.dni) {
        payerData.identification = {
          number: user.additionalInfo.dni,
        };
        if (user.additionalInfo.dniType) {
          payerData.identification.type = user.additionalInfo.dniType;
        }
      }

      if (user.address?.formatted.postalCode) {
        payerData.address = {
          zip_code: user.address.formatted.postalCode,
        };
        if (user.address.formatted.street) {
          payerData.address.street_name = user.address.formatted.street;
        }
        if (user.address.formatted.streetNumber) {
          const streetNum = Number(user.address.formatted.streetNumber);
          // Si es un número válido, lo usamos. Si es NaN, enviamos undefined (la API lo ignora y no falla).
          payerData.address.street_number = !isNaN(streetNum) ? streetNum : undefined;
        }
      }

      const preferenceData: any = {
        items: data.map((item: any) => {
          // Validar y asegurar tipos correctos
          const unitPrice = Number(item.unit_price);
          const quantity = Number(item.quantity);

          if (isNaN(unitPrice) || unitPrice <= 0) {
            throw new Error(`Invalid unit_price for item ${item.id || item.title}: ${item.unit_price}`);
          }
          if (isNaN(quantity) || quantity <= 0) {
            throw new Error(`Invalid quantity for item ${item.id || item.title}: ${item.quantity}`);
          }

          return {
            id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: item.title,
            quantity: quantity,
            unit_price: unitPrice,
            currency_id: 'ARS',
          };
        }),
        payer: payerData,
        back_urls: {
          success: 'https://google.com',
          failure: `${ENV.FRONTEND_URL}/checkout/failure?session=${sessionId}`,
          pending: `${ENV.FRONTEND_URL}/checkout/pending?session=${sessionId}`,
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_methods: [{ id: 'pagofacil' }, { id: 'rapipago' }],
          excluded_payment_types: [{ id: 'ticket' }],
          installments: 1,
        },
        statement_descriptor: 'EASYFIT',
        external_reference: sessionId,
        notification_url: MERCADO_PAGO.MP_WEBHOOK_URL,
      };

      if (cost > 0) {
        preferenceData.shipments = {
          cost: Number(cost),
          mode: 'not_specified',
        };
      }

      const response = await mercadoPagoClient.preference.create({
        body: preferenceData,
      });

      return response.id;
    } catch (error: any) {
      throw new AppError(`MercadoPago preference creation failed: ${error.message}`, 400);
    }
  }
}
