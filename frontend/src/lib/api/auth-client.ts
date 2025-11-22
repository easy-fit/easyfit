import { BaseApiClient } from './base-client';
import type {
  LoginCredentials,
  LoginResponse,
  refreshTokenResponse,
  VerifyEmailResponse,
  RegisterCustomerDTO,
  RegisterResponse,
  RegisterMerchantDTO,
} from '@/types/auth';
import type { MessageResponse, DataResponse } from '@/types/global';

export class AuthClient extends BaseApiClient {
  public async registerCustomer(customer: RegisterCustomerDTO): Promise<RegisterResponse> {
    return this.fetchApi<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  public async registerMerchant(merchant: RegisterMerchantDTO): Promise<RegisterResponse> {
    return this.fetchApi<RegisterResponse>('/auth/register/stores', {
      method: 'POST',
      body: JSON.stringify(merchant),
    });
  }

  public async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  public async googleLogin(idToken: string): Promise<LoginResponse> {
    return this.fetchApi<LoginResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  public async logout(): Promise<void> {
    return this.fetchApi<void>('/auth/logout', { method: 'POST' });
  }

  public async refreshToken(): Promise<refreshTokenResponse> {
    return this.fetchApi<refreshTokenResponse>('/auth/refresh-token', {
      method: 'POST',
    });
  }

  public async verifyEmail(code: string): Promise<VerifyEmailResponse> {
    return this.fetchApi<VerifyEmailResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  public async resendVerificationCode(): Promise<VerifyEmailResponse> {
    return this.fetchApi<VerifyEmailResponse>('/auth/verify-email/resend', {
      method: 'POST',
    });
  }

  public async forgotPassword(email: string): Promise<MessageResponse> {
    return this.fetchApi<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  public async resetPassword(code: string, password: string): Promise<RegisterResponse> {
    return this.fetchApi<RegisterResponse>(`/auth/reset-password/${code}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  public async updatePassword(currentPassword: string, newPassword: string): Promise<RegisterResponse> {
    return this.fetchApi<RegisterResponse>('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  public async createSumsubApplicant(): Promise<DataResponse> {
    return this.fetchApi<DataResponse>('/auth/kyc/applicants', {
      method: 'POST',
    });
  }

  public async createSumsubSessionLink(): Promise<DataResponse> {
    return this.fetchApi<DataResponse>('/auth/kyc/sdk-links', {
      method: 'POST',
    });
  }
}
