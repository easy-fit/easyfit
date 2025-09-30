import { Address } from './global';
import { ShippingType } from './order';

export type StoreStatus = 'active' | 'inactive' | 'disabled';
export type StoreType = 'physical' | 'online';
export type BillingStatus = 'pending' | 'rejected' | 'accepted';
export type TaxStatus = 'monotributista' | 'responsable_inscripto' | 'exento';
export type DocumentType = 'afip_certificate' | 'monotributo_receipt' | 'other';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';
export type AccountType = 'cbu' | 'alias';

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
  uploadedAt: string;
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
  completedAt?: string;
  lastUpdatedAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface Store {
  contactInfo: any;
  contactInfo: any;
  location: any;
  bannerUrl: string;
  description: string | undefined;
  _id: string;
  merchantId: string;
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
  createdAt: string;
  updatedAt: string;
  approximateDeliveryTime?: number | null; // minutes
  approximateShippingCost?: number | null; // cents
}

export interface CreateStoreDTO {
  name: string;
  address: Address;
  pickupHours: PickupHours;
  options?: StoreOptions;
  contactEmail: string;
  contactPhone?: string;
  storeType: StoreType;
  customization?: StoreCustomization;
  tags: string[];
  slug?: string;
  billing?: {
    fiscalInfo: FiscalInfo;
    bankingInfo: BankingInfo;
  };
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
  data: {
    store: Store;
    uploadInfo: {
      key: string;
      url: string;
    };
  };
}

export interface StoreCommonResponse {
  data: Store;
}

export interface getDashboardResponse {
  status: string;
  data: {
    dashboard: {
      summary: {
        totalStores: number;
        activeStores: number;
        inactiveStores: number;
        totalProducts: number;
        totalOrders: number;
        completedOrders: number;
        weeklyRevenue: number;
        weeklyRevenueChange: number;
        weeklyProductGrowth: number;
      };
      stores: Store<Partial>[];
    };
  };
}

// Store order analytics response
export interface StoreOrderAnalytics {
  pending: number;
  accepted: number;
  rejected: number;
  totalToday: number;
  avgResponseTime: string;
}

export interface StoreOrderAnalyticsResponse {
  status: 'success';
  data: StoreOrderAnalytics;
}

// Store orders response (matches backend implementation)
export interface StoreOrderItem {
  id: string;
  name: string; // product name from backend
  variant?: string; // combined color/size string like "Blue / M"
  quantity: number; // quantity from backend
  price: string; // formatted price like "$1,500"
  sku: string;
}

export interface StoreOrder {
  id: string;
  number: string;
  customer: string;
  items: StoreOrderItem[];
  total: string;
  status: string;
  placedAt: string;
  createdAt: string;
  deliveryType?: ShippingType;
}

export interface StoreOrdersPagination {
  current: number;
  total: number;
  count: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StoreOrdersData {
  orders: StoreOrder[];
  pagination: StoreOrdersPagination;
}

export interface StoreOrdersResponse {
  status: 'success';
  data: StoreOrdersData;
}

// Billing Management Types
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

export interface StoreBillingResponse {
  status: 'success';
  data: StoreBilling;
}

export interface TaxDocumentUploadResponse {
  status: 'success';
  data: {
    billing: StoreBilling;
    uploadInfo: {
      key: string;
      url: string;
    };
  };
}

export interface BillingStatusResponse {
  status: 'success';
  data: {
    billing: StoreBilling;
  };
}
