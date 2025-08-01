import { User } from './user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface RegisterCustomerDTO {
  name: string;
  surname: string;
  email: string;
  password: string;
  additionalInfo?: {
    dni?: string;
    dniType?: 'DNI' | 'CI' | 'LC' | 'LE';
    birthDate?: Date;
    phone?: {
      areaCode?: string;
      number?: string;
    };
  };
}

export interface RegisterMerchantDTO {
  name: string;
  surname: string;
  email: string;
  password: string;
  additionalInfo?: {
    dni?: string;
    dniType?: 'DNI' | 'CI' | 'LC' | 'LE';
    birthDate?: Date;
    phone?: {
      areaCode?: string;
      number?: string;
    };
  };
  merchantInfo: {
    storeCount: number;
  };
}

export interface RegisterResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface refreshTokenResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface VerifyEmailResponse {
  status: string;
  message: string;
  expiresAt?: Date;
}
