import sgMail from '../lib/sendgrid.client';
import { SENDGRID_CONFIG } from '../config/env';

interface EmailPayload {
  to: string;
  subject: string;
  dynamic_template_data?: Record<string, any>;
  templateId: string;
}

export class EmailService {
  static async sendEmail({ to, subject, dynamic_template_data, templateId }: EmailPayload) {
    const msg = {
      to,
      from: SENDGRID_CONFIG.FROM_EMAIL,
      subject,
      templateId: templateId,
      dynamic_template_data: dynamic_template_data,
    };

    await sgMail.send(msg);
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    return this.sendEmail({
      to: email,
      subject: 'Reset your EasyFit password',
      templateId: SENDGRID_CONFIG.TEMPLATE_ID_PASSWORD_RESET,
      dynamic_template_data: {
        url,
      },
    });
  }

  static async sendVerificationCode(email: string, code: string) {
    return this.sendEmail({
      to: email,
      subject: 'Verify your EasyFit email',
      templateId: SENDGRID_CONFIG.TEMPLATE_ID_EMAIL_VERIFICATION,
      dynamic_template_data: {
        code,
      },
    });
  }

  static async sendOrderReceipt(email: string, total: number, storeName: string, shippingCost: number) {
    const subtotal = total - shippingCost;
    return this.sendEmail({
      to: email,
      subject: 'Your EasyFit Order Receipt',
      templateId: SENDGRID_CONFIG.TEMPLATE_ID_ORDER_RECIPT,
      dynamic_template_data: {
        total,
        storeName,
        shippingCost,
        subtotal,
      },
    });
  }
}
