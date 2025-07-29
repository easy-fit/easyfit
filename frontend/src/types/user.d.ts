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
  additionalInfo?: AdditionalInfo;
  role: UserRole;
  address?: Address;
  emailVerification: EmailVerification;
  riderInfo?: RiderInfo;
  merchantInfo?: MerchantInfo;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  name: string;
  surname: string;
  email: string;
  password: string;
  additionalInfo?: AdditionalInfo;
  address?: Address;
  riderInfo?: RiderInfoDTO;
  merchantInfo?: MerchantInfo;
}

export interface updateUserDTO {
  name?: string;
  surname?: string;
  additionalInfo?: AdditionalInfo;
  address?: Address;
  riderInfo?: RiderInfoDTO;
  merchantInfo?: MerchantInfo;
}

export interface getUsersResponse {
  total: number;
  users: User[];
}

export interface getUserResponse {
  user: User;
}

export interface Me {
  data: {
    user: User;
  };
}
