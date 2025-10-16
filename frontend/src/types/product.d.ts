import { Variant, CreateVariantDTO } from './variant';
import { SignedUrl } from './global';
import { Store } from './store';
import { ShippingType } from './order';

export type ProductStatus = 'published' | 'draft' | 'deleted';

// Hierarchical category system
export type Gender = 'hombre' | 'mujer' | 'ninos';
export type AgeGroup = '1-6' | '6-14' | '0-18m';

// Main category types
export type HombreCategoryKeys =
  | 'ver-todo'
  | 'abrigos'
  | 'blazers'
  | 'buzos'
  | 'camisetas'
  | 'camisas'
  | 'deportivo'
  | 'jeans'
  | 'mochilas-bolsos'
  | 'pantalones'
  | 'polos'
  | 'bermudas'
  | 'sobrecamisas'
  | 'sweaters-cardigans'
  | 'trajes'
  | 'zapatillas'
  | 'zapatos'
  | 'accesorios';

export type MujerCategoryKeys =
  | 'ver-todo'
  | 'abrigos'
  | 'blazers'
  | 'buzos'
  | 'calzas'
  | 'camisetas-remeras'
  | 'camisas-blusas'
  | 'corseteria'
  | 'deportivo'
  | 'jeans'
  | 'mallas'
  | 'mochilas-bolsos-carteras'
  | 'pantalones'
  | 'pijamas'
  | 'polleras-faldas'
  | 'shorts-bermudas'
  | 'sweaters-tejidos'
  | 'tops-bodies'
  | 'vestidos-monos'
  | 'trajes'
  | 'zapatillas'
  | 'zapatos'
  | 'accesorios';

export type NinaSubcategoryKeys =
  | 'ver-todo'
  | 'abrigos'
  | 'buzos'
  | 'camisetas'
  | 'camisas'
  | 'jeans'
  | 'pantalones'
  | 'vestidos-monos'
  | 'conjuntos'
  | 'faldas'
  | 'shorts'
  | 'sweaters'
  | 'zapatos'
  | 'bolsos'
  | 'pijamas'
  | 'accesorios';

export type NinoSubcategoryKeys =
  | 'ver-todo'
  | 'abrigos'
  | 'buzos'
  | 'camisetas'
  | 'camisas'
  | 'jeans'
  | 'pantalones'
  | 'bermudas'
  | 'conjuntos'
  | 'sweaters'
  | 'zapatos'
  | 'bolsos'
  | 'pijamas'
  | 'accesorios';

export type NinoAdolescenteSubcategoryKeys =
  | 'ver-todo'
  | 'abrigos'
  | 'buzos'
  | 'camisetas'
  | 'camisas'
  | 'jeans'
  | 'pantalones'
  | 'bermudas'
  | 'conjuntos'
  | 'sweaters'
  | 'trajes'
  | 'zapatos'
  | 'bolsos'
  | 'accesorios';

export type BebeCategoryKeys = 'ver-todo' | 'tops' | 'pantalones' | 'monos-sets' | 'zapatos' | 'accesorios';

// Flat category string for database storage (dot notation)
export type ProductCategory =
  // Hombre categories
  | `hombre.${HombreCategoryKeys}`
  // Mujer categories
  | `mujer.${MujerCategoryKeys}`
  // Niños categories
  | `ninos.nina.1-6.${NinaSubcategoryKeys}`
  | `ninos.nina.6-14.${NinaSubcategoryKeys}`
  | `ninos.nino.1-6.${NinoSubcategoryKeys}`
  | `ninos.nino.6-14.${NinoAdolescenteSubcategoryKeys}`
  | `ninos.bebe.0-18m.${BebeCategoryKeys}`;

// Category display information
export interface CategoryDisplayInfo {
  key: string;
  displayName: string;
  gender?: Gender;
  ageGroup?: AgeGroup;
  parentCategory?: string;
  level: 'main' | 'gender' | 'age' | 'subcategory';
}

export interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ProductFilterOptions {
  [key: string]: unknown;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string | string[]; // Single size or multiple sizes
  color?: string | string[]; // Single color or multiple colors
  storeId?: string | string[]; // Filter by store(s)
  inStock?: boolean; // Only show in-stock products
  freeShipping?: boolean; // Only show products with free shipping
  page?: number;
  limit?: number;
  sort?: string;
}

export interface Product {
  _id: string;
  storeId: string;
  title: string;
  description: string;
  status: ProductStatus;
  category: ProductCategory;
  slug: string;
  allowedShippingTypes?: ShippingType[];
  createdAt: string;
  updatedAt: string;
  // Enhanced fields from aggregation
  variants?: Variant[];
  store?: Store;
  minPrice?: number;
  defaultImage?: string;
  availableColors?: string[];
}

export interface CreateProductDTO {
  storeId: string;
  product: {
    title: string;
    category: string;
    status: string;
    description?: string;
    allowedShippingTypes?: ShippingType[];
  };
  variants: CreateVariantDTO[];
}

export interface UpdateProductDTO {
  title?: string;
  description?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  slug?: string;
  allowedShippingTypes?: ShippingType[];
}

export interface GetProductsResponse {
  status: string;
  results: number;
  pagination: PaginationInfo;
  data: {
    products: Product[];
  };
}

export interface CreateProductResponse {
  data: {
    product: Product;
    signedUrls: SignedUrl[];
  };
}

export interface ProductCommonResponse {
  total?: number;
  data: Product;
}

export interface ProductsByStoreResponse {
  total: number;
  data: Product[];
}

export interface BulkProductUpdateDTO {
  productIds: string[];
  updateData: UpdateProductDTO;
}

export interface BulkProductUpdateResponse {
  successful: number;
  failed: number;
  total: number;
  errors: string[];
}

export interface BulkUploadValidationError {
  row: number;
  field: string;
  error: string;
  data: any;
}

export interface BulkUploadResponse {
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    productsCreated: number;
    variantsCreated: number;
    errors: number;
  };
  errors: BulkUploadValidationError[];
  warnings: Array<{
    row: number;
    warning: string;
  }>;
}
