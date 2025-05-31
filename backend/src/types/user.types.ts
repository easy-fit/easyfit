export type UserRole = 'customer' | 'merchant' | 'rider' | 'admin';
export type KycStatus =
  | 'verified'
  | 'rejected'
  | 'disabled'
  | 'documents-requested'
  | 'resubmission-requested'
  | 'pending'
  | 'requires-action';

export interface RiderInfo {
  dni: string;
  cuil: string;
  vehicleType: 'bike' | 'motorcycle';
  licensePlate?: string;
  kycStatus: KycStatus;
  score?: {
    upvotes: number;
    downvotes: number;
  };
}

export interface MerchantInfo {
  dni: string;
  cuit: string;
  storeCount: number;
  kycStatus: KycStatus;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  birthDate: Date;
  address?: {
    formatted: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;
  refreshToken?: string;
  riderInfo?: RiderInfo;
  merchantInfo?: MerchantInfo;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: {
    formatted: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  riderInfo?: RiderInfo;
  merchantInfo?: MerchantInfo;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    formatted?: string;
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  riderInfo?: Partial<RiderInfo>;
  merchantInfo?: Partial<MerchantInfo>;
}

export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  birthDate: Date;
  address?: {
    formatted?: string;
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
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
