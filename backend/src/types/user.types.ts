import { Address } from './global';

export type UserRole = 'customer' | 'merchant' | 'rider' | 'admin' | 'manager';
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

export interface ManagerInfo {
  assignedStores: string[];
  assignedBy: string;
  createdAt: Date;
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
  passwordHash?: string;
  googleId?: string;
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
  managerInfo?: ManagerInfo;
}

export interface GoogleAuthDTO {
  idToken: string;
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
  managerInfo?: ManagerInfo;
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
  managerInfo?: ManagerInfo;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface CreateManagerDTO {
  name: string;
  surname: string;
  email: string;
  password: string;
  additionalInfo?: AdditionalInfo;
  storeId: string;
}

export interface RegisterManagerDTO {
  name: string;
  surname: string;
  email: string;
  password: string;
  additionalInfo?: AdditionalInfo;
  storeIds: string[];
  assignedBy: string;
}
