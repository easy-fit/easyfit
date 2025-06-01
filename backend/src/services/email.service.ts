import sgMail from '../config/sendgrid';
import { SENDGRID_CONFIG } from '../config/env';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  static async sendEmail({ to, subject, html }: EmailPayload) {
    const msg = {
      to,
      from: SENDGRID_CONFIG.FROM_EMAIL,
      subject,
      html,
    };

    await sgMail.send(msg);
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const html = `
      <p>Hi!</p>
      <p>You requested a password reset. Click the link below to reset it:</p>
      <a href="${url}">${url}</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset your EasyFit password',
      html,
    });
  }

  static async sendVerificationCode(email: string, code: string) {
    const html = `
      <p>Welcome to EasyFit!</p>
      <p>Your email verification code is: <strong>${code}</strong></p>
      <p>This code expires in 10 minutes.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify your EasyFit email',
      html,
    });
  }
}
