import { Types } from 'mongoose';
import { Address } from './global';

export type StoreStatus = 'active' | 'inactive' | 'disabled';
export type StoreType = 'physical' | 'online';

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

export interface Store {
  merchantId: Types.ObjectId;
  name: string;
  address: Address;
  cuit?: string;
  pickupHours: PickupHours;
  options: StoreOptions;
  contactEmail: string;
  contactPhone?: string;
  status: StoreStatus;
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
  cuit?: string;
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
  cuit?: string;
  pickupHours?: PickupHours;
  options?: StoreOptions;
  contactEmail?: string;
  contactPhone?: string;
  status?: StoreStatus;
  tags?: string[];
  customization?: StoreCustomization;
  isOpen?: boolean;
}
