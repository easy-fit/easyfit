import sgMail from '../lib/sendgrid.client';
import { SENDGRID_CONFIG } from '../config/env';

interface EmailPayload {
  to: string;
  subject: string;
  dynamic_template_data?: Record<string, any>;
  templateId?: string;
  html?: string;
}

interface CriticalAlertContext {
  orderId?: string;
  operation: string;
  error: Error;
  metadata?: any;
  severity?: 'critical' | 'high';
  timestamp?: Date;
}

export class EmailService {
  static async sendEmail({ to, subject, dynamic_template_data, templateId, html }: EmailPayload) {
    const msg: any = {
      to,
      from: SENDGRID_CONFIG.FROM_EMAIL,
      subject,
    };

    if (html) {
      msg.html = html;
    } else if (templateId) {
      msg.templateId = templateId;
      msg.dynamic_template_data = dynamic_template_data;
    }

    await sgMail.send(msg);
  }

  static async sendPasswordReset(email: string, token: string) {
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

  static async sendLoginAlert(email: string, browser: string) {
    const loginTime = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
    });
    return this.sendEmail({
      to: email,
      subject: 'New Login',
      templateId: SENDGRID_CONFIG.TEMPLATE_ID_LOGIN_ALERT,
      dynamic_template_data: {
        browser,
        loginTime,
      },
    });
  }

  // Critical Alert Methods
  static async sendCriticalPaymentAlert(context: CriticalAlertContext) {
    const adminEmails = this.getAdminEmails();
    const alertKey = `payment-alert-${context.orderId}-${context.operation}`;

    if (!this.shouldSendEmail(alertKey)) {
      console.log(`Throttled payment alert for ${alertKey}`);
      return;
    }

    const timestamp = context.timestamp || new Date();
    const timestampStr = timestamp.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
    });

    const html = this.generatePaymentAlertHTML({
      orderId: context.orderId || 'N/A',
      operation: context.operation,
      errorMessage: context.error.message,
      errorStack: context.error.stack?.substring(0, 500),
      severity: context.severity || 'critical',
      timestamp: timestampStr,
      metadata: context.metadata,
    });

    await this.sendEmailToAdmins(
      adminEmails,
      `🚨 EasyFit Payment Issue - Order ${context.orderId || 'Unknown'}`,
      html
    );
  }

  static async sendRiderAssignmentAlert(context: CriticalAlertContext & { attempts?: number; strategies?: string[] }) {
    const adminEmails = this.getAdminEmails();
    const alertKey = `rider-alert-${context.orderId}-${context.operation}`;

    if (!this.shouldSendEmail(alertKey)) {
      console.log(`Throttled rider assignment alert for ${alertKey}`);
      return;
    }

    const timestamp = context.timestamp || new Date();
    const timestampStr = timestamp.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
    });

    const html = this.generateRiderAlertHTML({
      orderId: context.orderId || 'N/A',
      operation: context.operation,
      errorMessage: context.error.message,
      attempts: context.attempts || 0,
      strategiesAttempted: context.strategies?.join(', ') || 'Standard assignment',
      severity: context.severity || 'critical',
      timestamp: timestampStr,
      metadata: context.metadata,
    });

    await this.sendEmailToAdmins(
      adminEmails,
      `🚨 EasyFit Rider Assignment Failed - Order ${context.orderId || 'Unknown'}`,
      html
    );
  }

  static async sendOrderManagementAlert(context: CriticalAlertContext) {
    const adminEmails = this.getAdminEmails();
    const alertKey = `order-alert-${context.orderId}-${context.operation}`;

    if (!this.shouldSendEmail(alertKey)) {
      console.log(`Throttled order management alert for ${alertKey}`);
      return;
    }

    const timestamp = context.timestamp || new Date();
    const timestampStr = timestamp.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
    });

    const html = this.generateOrderAlertHTML({
      orderId: context.orderId || 'N/A',
      operation: context.operation,
      errorMessage: context.error.message,
      errorStack: context.error.stack?.substring(0, 500),
      severity: context.severity || 'critical',
      timestamp: timestampStr,
      metadata: context.metadata,
    });

    await this.sendEmailToAdmins(
      adminEmails,
      `🚨 EasyFit Order Issue - Order ${context.orderId || 'Unknown'}`,
      html
    );
  }

  static async sendCriticalSystemAlert(context: CriticalAlertContext) {
    const adminEmails = this.getAdminEmails();
    const alertKey = `system-alert-${context.operation}-${context.orderId || 'global'}`;

    if (!this.shouldSendEmail(alertKey)) {
      console.log(`Throttled system alert for ${alertKey}`);
      return;
    }

    const timestamp = context.timestamp || new Date();
    const timestampStr = timestamp.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
    });

    const html = this.generateSystemAlertHTML({
      operation: context.operation,
      errorMessage: context.error.message,
      errorStack: context.error.stack?.substring(0, 500),
      severity: context.severity || 'critical',
      timestamp: timestampStr,
      orderId: context.orderId || 'System-wide',
      metadata: context.metadata,
    });

    await this.sendEmailToAdmins(
      adminEmails,
      `🚨 EasyFit System Alert - ${context.operation}`,
      html
    );
  }

  // Helper method to get admin emails
  private static getAdminEmails(): string[] {
    const adminEmailsString = SENDGRID_CONFIG.ADMIN_ALERT_EMAILS;
    if (!adminEmailsString) {
      console.warn('No admin emails configured for critical alerts. Set ADMIN_ALERT_EMAILS environment variable.');
      return [];
    }
    const emails = adminEmailsString.split(',').map(email => email.trim()).filter(email => email.length > 0);

    // Validate email format
    const validEmails = emails.filter(email => this.isValidEmail(email));
    if (validEmails.length !== emails.length) {
      console.warn(`Some admin emails are invalid. Valid: ${validEmails.length}, Total: ${emails.length}`);
    }

    return validEmails;
  }

  // Email throttling mechanism to prevent spam
  private static emailThrottleCache = new Map<string, number>();
  private static readonly THROTTLE_DURATION_MS = 2 * 60 * 1000; // 2 minutes (reduced from 10)

  static shouldSendEmail(alertKey: string): boolean {
    const now = Date.now();
    const lastSent = this.emailThrottleCache.get(alertKey);

    if (!lastSent || (now - lastSent) > this.THROTTLE_DURATION_MS) {
      this.emailThrottleCache.set(alertKey, now);
      return true;
    }

    return false;
  }

  // Email validation helper
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Improved email sending with better error handling
  private static async sendEmailToAdmins(adminEmails: string[], subject: string, html: string): Promise<void> {
    if (adminEmails.length === 0) {
      throw new Error('No valid admin emails configured');
    }

    const sendResults = await Promise.allSettled(
      adminEmails.map(async (email) => {
        try {
          await this.sendEmail({ to: email, subject, html });
          return { email, success: true };
        } catch (error: any) {
          console.error(`Failed to send admin alert to ${email}:`, error.message);
          throw error;
        }
      })
    );

    const failures = sendResults.filter(result => result.status === 'rejected');
    const successes = sendResults.filter(result => result.status === 'fulfilled');

    if (failures.length > 0) {
      const failedEmails = failures.map((result, index) => adminEmails[index]);
      console.error(`Failed to send admin alerts to: ${failedEmails.join(', ')}`);

      // If ALL emails failed, throw error
      if (successes.length === 0) {
        throw new Error(`All admin alert emails failed. Recipients: ${adminEmails.join(', ')}`);
      }
    }
  }

  // HTML Generation Methods
  private static generatePaymentAlertHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 15px; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border: 1px solid #ddd; }
            .footer { background: #6c757d; color: white; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; color: #495057; }
            .error-stack { background: #f1f1f1; padding: 10px; font-family: monospace; font-size: 12px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🚨 EasyFit Payment Critical Alert</h2>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Order ID:</span> ${data.orderId}
              </div>
              <div class="field">
                <span class="label">Operation:</span> ${data.operation}
              </div>
              <div class="field">
                <span class="label">Severity:</span> <strong>${data.severity.toUpperCase()}</strong>
              </div>
              <div class="field">
                <span class="label">Timestamp:</span> ${data.timestamp}
              </div>
              <div class="field">
                <span class="label">Error Message:</span><br>
                <strong style="color: #dc3545;">${data.errorMessage}</strong>
              </div>
              ${data.errorStack ? `
              <div class="field">
                <span class="label">Error Details:</span>
                <pre class="error-stack">${data.errorStack}</pre>
              </div>` : ''}
              ${data.metadata ? `
              <div class="field">
                <span class="label">Metadata:</span>
                <pre class="error-stack">${JSON.stringify(data.metadata, null, 2)}</pre>
              </div>` : ''}
            </div>
            <div class="footer">
              <p>Immediate action required. Check payment systems and resolve issue.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateRiderAlertHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #fd7e14; color: white; padding: 15px; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border: 1px solid #ddd; }
            .footer { background: #6c757d; color: white; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; color: #495057; }
            .error-stack { background: #f1f1f1; padding: 10px; font-family: monospace; font-size: 12px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🚨 EasyFit Rider Assignment Failed</h2>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Order ID:</span> ${data.orderId}
              </div>
              <div class="field">
                <span class="label">Operation:</span> ${data.operation}
              </div>
              <div class="field">
                <span class="label">Assignment Attempts:</span> ${data.attempts}
              </div>
              <div class="field">
                <span class="label">Strategies Tried:</span> ${data.strategiesAttempted}
              </div>
              <div class="field">
                <span class="label">Severity:</span> <strong>${data.severity.toUpperCase()}</strong>
              </div>
              <div class="field">
                <span class="label">Timestamp:</span> ${data.timestamp}
              </div>
              <div class="field">
                <span class="label">Error Message:</span><br>
                <strong style="color: #fd7e14;">${data.errorMessage}</strong>
              </div>
              ${data.metadata ? `
              <div class="field">
                <span class="label">Metadata:</span>
                <pre class="error-stack">${JSON.stringify(data.metadata, null, 2)}</pre>
              </div>` : ''}
            </div>
            <div class="footer">
              <p>Manual rider assignment required. Check available riders and assign manually.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateOrderAlertHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6f42c1; color: white; padding: 15px; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border: 1px solid #ddd; }
            .footer { background: #6c757d; color: white; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; color: #495057; }
            .error-stack { background: #f1f1f1; padding: 10px; font-family: monospace; font-size: 12px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🚨 EasyFit Order Management Alert</h2>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Order ID:</span> ${data.orderId}
              </div>
              <div class="field">
                <span class="label">Operation:</span> ${data.operation}
              </div>
              <div class="field">
                <span class="label">Severity:</span> <strong>${data.severity.toUpperCase()}</strong>
              </div>
              <div class="field">
                <span class="label">Timestamp:</span> ${data.timestamp}
              </div>
              <div class="field">
                <span class="label">Error Message:</span><br>
                <strong style="color: #6f42c1;">${data.errorMessage}</strong>
              </div>
              ${data.errorStack ? `
              <div class="field">
                <span class="label">Error Details:</span>
                <pre class="error-stack">${data.errorStack}</pre>
              </div>` : ''}
              ${data.metadata ? `
              <div class="field">
                <span class="label">Metadata:</span>
                <pre class="error-stack">${JSON.stringify(data.metadata, null, 2)}</pre>
              </div>` : ''}
            </div>
            <div class="footer">
              <p>Order management issue detected. Review order status and resolve promptly.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateSystemAlertHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #198754; color: white; padding: 15px; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border: 1px solid #ddd; }
            .footer { background: #6c757d; color: white; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; color: #495057; }
            .error-stack { background: #f1f1f1; padding: 10px; font-family: monospace; font-size: 12px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🚨 EasyFit System Alert</h2>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Operation:</span> ${data.operation}
              </div>
              <div class="field">
                <span class="label">Order ID:</span> ${data.orderId}
              </div>
              <div class="field">
                <span class="label">Severity:</span> <strong>${data.severity.toUpperCase()}</strong>
              </div>
              <div class="field">
                <span class="label">Timestamp:</span> ${data.timestamp}
              </div>
              <div class="field">
                <span class="label">Error Message:</span><br>
                <strong style="color: #198754;">${data.errorMessage}</strong>
              </div>
              ${data.errorStack ? `
              <div class="field">
                <span class="label">Error Details:</span>
                <pre class="error-stack">${data.errorStack}</pre>
              </div>` : ''}
              ${data.metadata ? `
              <div class="field">
                <span class="label">Metadata:</span>
                <pre class="error-stack">${JSON.stringify(data.metadata, null, 2)}</pre>
              </div>` : ''}
            </div>
            <div class="footer">
              <p>System-level issue detected. Monitor system health and resolve if necessary.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
