import { BaseApiClient } from './base-client';
import {
  CheckoutSession,
  CheckoutCommonResponse,
  CreateCheckoutSessionDTO,
  CreateCheckoutSessionResponse,
  UpdateCheckoutSessionDTO,
  PaymentProcessingRequest,
  processPaymentResponse,
} from '@/types/checkout';

export class CheckoutClient extends BaseApiClient {
  public async getCheckoutSessions(): Promise<{ status: string; data: { checkoutSessions: CheckoutSession } }> {
    return this.fetchApi<{ status: string; data: { checkoutSessions: CheckoutSession } }>('/checkout');
  }

  public async getCheckoutSessionById(id: string): Promise<CheckoutCommonResponse> {
    return this.fetchApi<CheckoutCommonResponse>(`/checkout/${id}`);
  }

  public async createCheckoutSession(data: CreateCheckoutSessionDTO): Promise<CreateCheckoutSessionResponse> {
    return this.fetchApi<CreateCheckoutSessionResponse>('/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateCheckoutSession(id: string, data: UpdateCheckoutSessionDTO): Promise<CheckoutCommonResponse> {
    return this.fetchApi<CheckoutCommonResponse>(`/checkout/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async processPayment(data: PaymentProcessingRequest, id: string): Promise<processPaymentResponse> {
    return this.fetchApi<processPaymentResponse>(`/checkout/${id}/process-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
