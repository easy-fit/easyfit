import { Address } from './global';

export type StoreStatus = 'active' | 'inactive' | 'disabled';
export type StoreType = 'physical' | 'online';
export interface PickupHoursEntry {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  open: string;
  close: string;
}

export interface StoreFilterOptions {
  [key: string]: unknown;
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

export interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface Store {
  _id: string;
  merchantId: string;
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
  createdAt: string;
  updatedAt: string;
  approximateDeliveryTime?: number | null; // minutes
  approximateShippingCost?: number | null; // cents
}

export interface CreateStoreDTO {
  name: string;
  address: Address;
  cuit?: string;
  pickupHours: PickupHours;
  options?: StoreOptions;
  contactEmail: string;
  contactPhone?: string;
  storeType: StoreType;
  customization?: StoreCustomization;
  tags: string[];
  slug?: string;
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

export interface GetStoresResponse {
  status: string;
  results: number;
  pagination: PaginationInfo;
  data: {
    stores: Store[];
  };
}

export interface StoreAssetUploadResponse {
  status: string;
  data: Store;
  uploadInfo: {
    key: string;
    url: string;
  };
}

export interface StoreCommonResponse {
  data: Store;
}
