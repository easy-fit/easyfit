export type UserRole = 'consumer' | 'seller' | 'rider' | 'admin';
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
  birthDate: Date;
  vehicleType: 'bike' | 'motorcycle';
  licensePlate?: string;
  kycStatus: KycStatus;
}

export interface SellerInfo {
  dni: string;
  cuit: string;
  birthDate: Date;
  storeCount: number;
  kycStatus: KycStatus;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  address?: {
    formatted: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  riderInfo?: RiderInfo;
  sellerInfo?: SellerInfo;
}
