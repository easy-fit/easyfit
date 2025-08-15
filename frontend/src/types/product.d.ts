import { Variant, CreateVariantDTO } from './variant';
import { SignedUrl } from './global';
import { Store } from './store';

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
  | 'camisetas-remeras'
  | 'camisas-blusas'
  | 'jeans'
  | 'mochilas-bolsos-carteras'
  | 'pantalones'
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
  };
  variants: CreateVariantDTO[];
}

export interface UpdateProductDTO {
  title?: string;
  description?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  slug?: string;
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
