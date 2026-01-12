import { MercadoPagoConfig, Payment, Preference, PaymentRefund } from 'mercadopago';
import { MERCADO_PAGO } from '../config/env';

export class MercadoPagoClient {
  private static instance: MercadoPagoClient;
  private config: MercadoPagoConfig;
  public payment: Payment;
  public preference: Preference;
  public paymentRefund: PaymentRefund;

  private constructor() {
    const accessToken = MERCADO_PAGO.MP_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('MP_ACCESS_TOKEN no está configurado en las variables de entorno');
    }

    this.config = new MercadoPagoConfig({
      accessToken: accessToken,
      options: {
        timeout: 5000,
      },
    });

    this.payment = new Payment(this.config);
    this.preference = new Preference(this.config);
    this.paymentRefund = new PaymentRefund(this.config);
  }

  public static getInstance(): MercadoPagoClient {
    if (!MercadoPagoClient.instance) {
      MercadoPagoClient.instance = new MercadoPagoClient();
    }
    return MercadoPagoClient.instance;
  }

  public getConfig(): MercadoPagoConfig {
    return this.config;
  }
}

export const mercadoPagoClient = MercadoPagoClient.getInstance();