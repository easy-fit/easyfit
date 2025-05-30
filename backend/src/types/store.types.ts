import { Types } from 'mongoose';
export type StoreStatus = 'active' | 'inactive' | 'disabled';
export type StoreType = 'physical' | 'online';

export interface StoreAddress {
  formatted: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface PickupHoursEntry {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  open: string; // Ej: "09:00"
  close: string; // Ej: "18:00"
}

export type PickupHours = PickupHoursEntry[];

export interface ShippingOption {
  enabled: boolean;
  minOrderAmount?: number;
  promoLabel?: string;
}

export interface StoreOptions {
  freeShipping: ShippingOption;
}

export interface Store {
  sellerId: Types.ObjectId;
  name: string;
  address: StoreAddress;
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
  tags: string[];
  isOpen: boolean;
}

export interface CreateStoreDTO {
  sellerId: Types.ObjectId;
  name: string;
  address: StoreAddress;
  pickupHours: PickupHours;
  options: StoreOptions;
  contactEmail: string;
  contactPhone?: string;
  storeInteralId: number;
  storeType: StoreType;
  tags: string[];
}

export interface UpdateStoreDTO {
  name?: string;
  address?: StoreAddress;
  pickupHours?: PickupHours;
  options?: StoreOptions;
  contactEmail?: string;
  contactPhone?: string;
  status?: StoreStatus;
  tags?: string[];
  isOpen?: boolean;
}
