export type UserRole = 'customer' | 'merchant' | 'rider' | 'admin';
export interface Kyc {
  status: string;
  applicantId: string;
  reviewResult?: string;
  updatedAt?: Date;
}

export interface RiderInfo {
  dni: string;
  cuil: string;
  vehicleType: 'bike' | 'motorcycle';
  licensePlate?: string;
  kyc: Kyc;
  photoUrl?: string;
  score?: {
    upvotes: number;
    downvotes: number;
  };
}

export interface MerchantInfo {
  dni: string;
  cuit: string;
  storeCount: number;
  kyc: Kyc;
}

export interface EmailVerification {
  code?: string;
  expires?: Date;
  attempts: number;
  verified: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
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
  emailVerification: EmailVerification;
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
