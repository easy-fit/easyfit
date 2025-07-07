export interface CreatePaymentRequest {
  transaction_amount: number;
  installments: number;
  capture: boolean;
  payment_method_id: string;
  issuer_id: string;
  token: string;
  external_reference?: string;
  notification_url?: string;
  metadata?: {
    order_number?: string;
    [key: string]: any;
  };
  payer: {
    first_name: string;
    last_name: string;
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  statement_descriptor?: string;
  description?: string;
  additional_info?: {
    items?: PaymentItem[];
    payer?: PaymentPayerInfo;
  };
}

interface PaymentItem {
  id: string;
  title: string;
  description?: string;
  picture_url?: string;
  quantity: number;
  unit_price: number;
}

interface PaymentPayerInfo {
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
  registration_date?: string;
}

export interface CreatePreferenceRequest {
  items: PreferenceItem[];
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    identification?: {
      type?: string;
      number?: string;
    };
    address: {
      zip_code?: string;
      street_name?: string;
      street_number?: string;
    };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  shipments: {
    cost: number;
    free_shipping: boolean;
    mode: string;
  };
  notification_url?: string;
  external_reference?: string;
}

export interface PreferenceItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

export interface MercadoPagoWebhookPayload {
  action: string;
  api_version: string;
  data: {
    id: string;
    [key: string]: any;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

export interface PaymentProcessingRequest {
  token: string;
  issuer_id: string;
  payment_method_id: string;
  transaction_amount: number;
  payment_type_id: string;
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
