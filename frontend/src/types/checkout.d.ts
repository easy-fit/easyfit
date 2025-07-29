import { Order } from './order';

export type CheckoutStatus = 'active' | 'completed' | 'cancelled';

export interface CheckoutCartItem {
  variantId: string;
  quantity: number;
  price: number;
  unit_price: number;
}

export interface CheckoutSession {
  _id: string;
  userId: string;
  storeId: string;
  cartItems: CheckoutCartItem[];
  subtotal: number;
  shipping: ShippingInfo;
  total: number;
  status: CheckoutStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckoutSessionDTO {
  shipping: ShippingInfo;
}

export interface UpdateCheckoutSessionDTO {
  deliveryType?: ShippingType;
}

export interface CreateCheckoutSessionResponse {
  status: string;
  data: { CheckoutSession: CheckoutSession; preferenceId: string };
}

export interface CheckoutCommonResponse {
  status: string;
  data: { CheckoutSession: CheckoutSession };
}

export interface processPaymentResponse {
  status: string;
  data: {
    order: Order;
    paymentType: string;
    message: string;
  };
}

export interface PaymentProcessingRequest {
  token: string;
  issuer_id: string;
  payment_method_id: string;
  transaction_amount: number;
  selectedPaymentMethod: string;
  payment_method_option_id?: string | null;
  processing_mode?: string | null;
  installments: number;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
  additional_info?: {
    items?: Array<{
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
    }>;
    payer?: {
      first_name?: string;
      last_name?: string;
      phone?: {
        area_code?: string;
        number?: string;
      };
      address?: {
        zip_code?: string;
        street_name?: string;
        street_number?: string;
      };
    };
  };
}
