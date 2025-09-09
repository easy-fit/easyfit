import { Types } from 'mongoose';
import { Address } from './global';

export type StoreStatus = 'active' | 'inactive' | 'disabled';
export type StoreType = 'physical' | 'online';
export type BillingStatus = 'pending' | 'rejected' | 'accepted';
export type TaxStatus = 'monotributista' | 'responsable_inscripto' | 'exento';
export type DocumentType = 'afip_certificate' | 'monotributo_receipt' | 'other';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';
export type AccountType = 'cbu' | 'alias';

export interface StoreFilterOptions {
  search?: string;
  tags?: string | string[];
  status?: string;
  isOpen?: boolean;
  rating?: number;
  page?: number;
  limit?: number;
  sort?: string;
  nearLocation?: {
    longitude: number;
    latitude: number;
    maxDistance?: number;
  };
}

export interface PickupHoursEntry {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  open: string;
  close: string;
}

export type PickupHours = PickupHoursEntry[];

export interface ShippingOption {
  enabled: boolean;
  minOrderAmount?: number;
  promoLabel?: string;
  subsidizedBy?: string;
}

export interface StoreOptions {
  freeShipping: ShippingOption;
}

export interface StoreCustomization {
  logoUrl?: string;
  bannerUrl?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
}

export interface FiscalInfo {
  cuit: string;
  businessName: string;
  taxStatus: TaxStatus;
  taxCategory?: string;
}

export interface TaxDocument {
  id: string;
  name: string;
  type: DocumentType;
  fileKey: string;
  uploadedAt: Date;
  status: DocumentStatus;
  size: number;
  rejectionReason?: string;
}

export interface BankingInfo {
  accountType: AccountType;
  cbu: string;
  bankName: string;
  accountHolder: string;
  alias?: string;
}

export interface StoreBilling {
  status: BillingStatus;
  fiscalInfo: FiscalInfo;
  taxDocuments: TaxDocument[];
  bankingInfo: BankingInfo;
  completedAt?: Date;
  lastUpdatedAt: Date;
}

export interface Store {
  merchantId: Types.ObjectId;
  name: string;
  address: Address;
  pickupHours: PickupHours;
  options: StoreOptions;
  contactEmail: string;
  contactPhone?: string;
  status: StoreStatus;
  billing: StoreBilling;
  ratingCount: number;
  ratingSum: number;
  averageRating: number;
  storeInternalId: number;
  storeType: StoreType;
  customization?: StoreCustomization;
  tags: string[];
  isOpen: boolean;
  slug: string;
}

export interface CreateStoreDTO {
  name: string;
  address: Address;
  pickupHours: PickupHours;
  options: StoreOptions;
  contactEmail: string;
  contactPhone?: string;
  storeInteralId: number;
  storeType: StoreType;
  customization?: StoreCustomization;
  tags: string[];
}

export interface UpdateStoreDTO {
  address?: Address;
  pickupHours?: PickupHours;
  options?: StoreOptions;
  contactEmail?: string;
  contactPhone?: string;
  status?: StoreStatus;
  tags?: string[];
  customization?: StoreCustomization;
  isOpen?: boolean;
}

// Billing-specific DTOs
export interface UpdateBillingDTO {
  fiscalInfo?: Partial<FiscalInfo>;
  bankingInfo?: Partial<BankingInfo>;
}

export interface UploadTaxDocumentDTO {
  fileName: string;
  type: DocumentType;
}

export interface UpdateDocumentStatusDTO {
  status: DocumentStatus;
  rejectionReason?: string;
}

export interface UpdateBillingStatusDTO {
  status: BillingStatus;
}

export interface BillingResponse {
  status: 'success';
  data: StoreBilling;
}
