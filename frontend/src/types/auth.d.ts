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

export interface RegisterRiderDTO {
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
  riderInfo: {
    cuit?: string;
    vehicleType: 'bike' | 'motorcycle' | 'car';
    licensePlate?: string;
    photoUrl?: string;
    score?: {
      upvotes: number;
      downvotes: number;
    };
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
