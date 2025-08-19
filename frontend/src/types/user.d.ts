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
  additionalInfo?: AdditionalInfo;
  role: UserRole;
  address?: Address;
  emailVerification: EmailVerification;
  riderInfo?: RiderInfo;
  merchantInfo?: MerchantInfo;
  managerInfo?: ManagerInfo;
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
  managerInfo?: ManagerInfo;
}

export interface updateUserDTO {
  name?: string;
  surname?: string;
  additionalInfo?: AdditionalInfo;
  address?: Address;
  riderInfo?: RiderInfoDTO;
  merchantInfo?: MerchantInfo;
  managerInfo?: ManagerInfo;
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

export interface CreateManagerDTO {
  name: string;
  surname: string;
  email: string;
  password: string;
  additionalInfo?: AdditionalInfo;
  storeId: string;
}

export interface StoreManagerAssignment {
  _id: string;
  storeId: string;
  managerId: string;
  assignedBy: string;
  assignedAt: Date;
  isActive: boolean;
  manager?: User;
  store?: any;
  assignedByUser?: User;
}
