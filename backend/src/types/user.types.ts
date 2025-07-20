import { Address } from './global';

export type UserRole = 'customer' | 'merchant' | 'rider' | 'admin';
export interface Kyc {
  status: string;
  applicantId: string;
  reviewResult?: string;
  updatedAt?: Date;
}

export interface RiderInfo {
  cuit?: string;
  vehicleType: 'bike' | 'motorcycle' | 'car';
  licensePlate?: string;
  kyc: Kyc;
  photoUrl?: string;
  score?: {
    upvotes: number;
    downvotes: number;
  };
}

export interface RiderInfoDTO {
  cuit?: string;
  vehicleType: 'bike' | 'motorcycle' | 'car';
  licensePlate?: string;
  photoUrl?: string;
  score?: {
    upvotes: number;
    downvotes: number;
  };
}

export interface MerchantInfo {
  storeCount: number;
  kyc: Kyc;
}

export interface EmailVerification {
  code?: string;
  expires?: Date;
  attempts: number;
  verified: boolean;
}

interface AdditionalInfo {
  dni?: string;
  dniType?: 'DNI' | 'CI' | 'LC' | 'LE';
  birthDate?: Date;
  phone?: {
    areaCode?: string;
    number?: string;
  };
}

export interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  passwordHash: string;
  additionalInfo?: AdditionalInfo;
  role: UserRole;
  address?: Address;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;
  refreshToken?: string;
  emailVerification: EmailVerification;
  riderInfo?: RiderInfo;
  merchantInfo?: MerchantInfo;
}

export interface CreateUserDTO {
  name: string;
  surname: string;
  email: string;
  password: string;
  additionalInfo?: AdditionalInfo;
  address?: Address;
  riderInfo?: RiderInfo;
  merchantInfo?: MerchantInfo;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  additionalInfo?: AdditionalInfo;
  address?: Address;
  riderInfo?: Partial<RiderInfoDTO>;
}

export interface RegisterDTO {
  name: string;
  surname: string;
  email: string;
  additionalInfo?: AdditionalInfo;
  password: string;
  address?: Address;
  riderInfo?: RiderInfo;
  merchantInfo?: MerchantInfo;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}
