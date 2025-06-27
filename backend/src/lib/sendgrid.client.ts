import sgMail from '@sendgrid/mail';
import { SENDGRID_CONFIG } from '../config/env';

sgMail.setApiKey(SENDGRID_CONFIG.API_KEY);

export default sgMail;
