import axios from 'axios';
import crypto from 'crypto';
import { UserModel } from '../models/user.model';
import { SUMSUB_CONFIG } from '../config/env';
import {
  SumsubApplicantResponse,
  WebhookPayload,
  SumsubWebSDKResponse,
} from '../types/sumsub.types';
import { AppError } from '../utils/appError';

export class KYCService {
  private static readonly BASE_URL = 'https://api.sumsub.com';
  private static readonly DEFAULT_LEVEL = SUMSUB_CONFIG.SUMSUB_LEVEL_NAME;
  private static readonly LANG = 'es';

  static async createApplicant(userId: string, role: string): Promise<string> {
    try {
      const levelName = this.DEFAULT_LEVEL;
      const endpoint = `/resources/applicants?levelName=${encodeURIComponent(
        levelName,
      )}`;

      const body = {
        externalUserId: userId,
        lang: this.LANG,
      };

      const response = await this.makeRequest<SumsubApplicantResponse>(
        'post',
        endpoint,
        body,
      );

      const applicantId = response.data.id;

      await UserModel.findByIdAndUpdate(userId, {
        [`${role}Info.kyc.applicantId`]: applicantId,
        [`${role}Info.kyc.createdAt`]: new Date(),
        [`${role}Info.kyc.status`]: 'created',
      });

      return applicantId;
    } catch (error) {
      console.error('Error creating Sumsub applicant:', error);
      throw new AppError(
        'Failed to create Sumsub applicant. Please try again later.',
        500,
      );
    }
  }

  static async generateWebSDKLink(
    userId: string,
    levelName = this.DEFAULT_LEVEL,
  ): Promise<string> {
    try {
      const body = {
        userId,
        levelName,
        ttlInSecs: 1800,
      };

      const endpoint = `/resources/sdkIntegrations/levels/-/websdkLink`;

      const response = await this.makeRequest<SumsubWebSDKResponse>(
        'post',
        endpoint,
        body,
      );

      return response.data.url;
    } catch (error) {
      console.error('Error generating Web SDK link:', error);
      throw new AppError(
        'Failed to generate Web SDK link. Please try again later.',
        500,
      );
    }
  }

  static async handleWebhook(payload: WebhookPayload): Promise<void> {
    try {
      const { applicantId, reviewResult, reviewStatus } = payload;

      const user = await UserModel.findOne({
        $or: [
          { 'riderInfo.kyc.applicantId': applicantId },
          { 'merchantInfo.kyc.applicantId': applicantId },
        ],
      });
      if (!user) {
        return;
      }

      const role = user.role;
      const result =
        reviewResult.reviewAnswer === 'GREEN' ? 'verified' : 'rejected';

      await UserModel.findByIdAndUpdate(
        user._id,
        {
          $set: {
            [`${role}Info.kyc.status`]: reviewStatus,
            [`${role}Info.kyc.reviewResult`]: result,
            [`${role}Info.kyc.updatedAt`]: new Date(),
          },
        },
        { new: true },
      );
    } catch (error) {
      console.error('Error handling Sumsub webhook:', error);
      // Don't throw here as webhooks should not fail the entire process
    }
  }

  private static buildSumsubHeaders(
    method: string,
    endpoint: string,
    body: any = '',
  ) {
    const ts = Math.floor(Date.now() / 1000).toString();
    const rawBody = body ? JSON.stringify(body) : '';
    const message = ts + method.toUpperCase() + endpoint + rawBody;

    const signature = crypto
      .createHmac('sha256', SUMSUB_CONFIG.SUMSUB_SECRET_KEY)
      .update(message)
      .digest('hex');

    return {
      'X-App-Token': SUMSUB_CONFIG.SUMSUB_API_TOKEN,
      'X-App-Access-Sig': signature,
      'X-App-Access-Ts': ts,
      'Content-Type': 'application/json',
    };
  }

  private static async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: any,
  ): Promise<{ data: T }> {
    const url = `${this.BASE_URL}${endpoint}`;
    const headers = this.buildSumsubHeaders(method, endpoint, body);

    const response = await axios({
      method,
      url,
      headers,
      data: body,
    });

    return response;
  }
}
