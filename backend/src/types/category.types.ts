// Category hierarchy structure for the e-commerce platform
// Supports: Hombre, Mujer, Niños (with age groups and subcategories)

export type Gender = 'hombre' | 'mujer' | 'ninos' | 'unisex';
export type AgeGroup = '1-6' | '6-14' | '0-18m';

// Main category structure
export interface CategoryHierarchy {
  hombre: HombreCategoryKeys;
  mujer: MujerCategoryKeys;
  ninos: NinosCategoryKeys;
  unisex: UnisexCategoryKeys;
}

// Unisex subcategories (common to both hombre and mujer)
export type UnisexCategoryKeys =
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
  | 'sweaters'
  | 'trajes'
  | 'zapatillas'
  | 'zapatos'
  | 'accesorios';

// Hombre subcategories
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

// Mujer subcategories
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

// Niños age groups and subcategories
export interface NinosCategoryKeys {
  nina: NinaCategoryKeys;
  nino: NinoCategoryKeys;
  bebe: BebeCategoryKeys;
}

export interface NinaCategoryKeys {
  '1-6': NinaSubcategoryKeys;
  '6-14': NinaSubcategoryKeys;
}

export interface NinoCategoryKeys {
  '1-6': NinoSubcategoryKeys;
  '6-14': NinoAdolescenteSubcategoryKeys;
}

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

export type BebeCategoryKeys = 
  | 'ver-todo'
  | 'tops'
  | 'pantalones'
  | 'monos-sets'
  | 'zapatos'
  | 'accesorios';

// Flat category string for database storage (dot notation)
export type ProductCategory =
  // Hombre categories
  | `hombre.${HombreCategoryKeys}`
  // Mujer categories
  | `mujer.${MujerCategoryKeys}`
  // Unisex categories
  | `unisex.${UnisexCategoryKeys}`
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

// All valid product category values for validation
export const PRODUCT_CATEGORY_VALUES: ProductCategory[] = [
  // Hombre categories
  'hombre.ver-todo', 'hombre.abrigos', 'hombre.blazers', 'hombre.buzos', 'hombre.camisetas',
  'hombre.camisas', 'hombre.deportivo', 'hombre.jeans', 'hombre.mochilas-bolsos', 'hombre.pantalones', 'hombre.polos',
  'hombre.bermudas', 'hombre.sobrecamisas', 'hombre.sweaters-cardigans', 'hombre.trajes',
  'hombre.zapatillas', 'hombre.zapatos', 'hombre.accesorios',
  
  // Mujer categories
  'mujer.ver-todo', 'mujer.abrigos', 'mujer.blazers', 'mujer.buzos', 'mujer.calzas', 'mujer.camisetas-remeras',
  'mujer.camisas-blusas', 'mujer.corseteria', 'mujer.deportivo', 'mujer.jeans', 'mujer.mallas', 'mujer.mochilas-bolsos-carteras', 'mujer.pantalones',
  'mujer.pijamas', 'mujer.polleras-faldas', 'mujer.shorts-bermudas', 'mujer.sweaters-tejidos', 'mujer.tops-bodies',
  'mujer.vestidos-monos', 'mujer.trajes', 'mujer.zapatillas', 'mujer.zapatos', 'mujer.accesorios',

  // Unisex categories
  'unisex.ver-todo', 'unisex.abrigos', 'unisex.blazers', 'unisex.buzos', 'unisex.camisetas',
  'unisex.camisas', 'unisex.deportivo', 'unisex.jeans', 'unisex.mochilas-bolsos', 'unisex.pantalones',
  'unisex.sweaters', 'unisex.trajes', 'unisex.zapatillas', 'unisex.zapatos', 'unisex.accesorios',

  // Niños - Niña 1-6
  'ninos.nina.1-6.ver-todo', 'ninos.nina.1-6.abrigos', 'ninos.nina.1-6.buzos', 'ninos.nina.1-6.camisetas',
  'ninos.nina.1-6.camisas', 'ninos.nina.1-6.jeans', 'ninos.nina.1-6.pantalones', 'ninos.nina.1-6.vestidos-monos',
  'ninos.nina.1-6.conjuntos', 'ninos.nina.1-6.faldas', 'ninos.nina.1-6.shorts', 'ninos.nina.1-6.sweaters',
  'ninos.nina.1-6.zapatos', 'ninos.nina.1-6.bolsos', 'ninos.nina.1-6.pijamas', 'ninos.nina.1-6.accesorios',
  
  // Niños - Niña 6-14
  'ninos.nina.6-14.ver-todo', 'ninos.nina.6-14.abrigos', 'ninos.nina.6-14.buzos', 'ninos.nina.6-14.camisetas',
  'ninos.nina.6-14.camisas', 'ninos.nina.6-14.jeans', 'ninos.nina.6-14.pantalones', 'ninos.nina.6-14.vestidos-monos',
  'ninos.nina.6-14.conjuntos', 'ninos.nina.6-14.faldas', 'ninos.nina.6-14.shorts', 'ninos.nina.6-14.sweaters',
  'ninos.nina.6-14.zapatos', 'ninos.nina.6-14.bolsos', 'ninos.nina.6-14.pijamas', 'ninos.nina.6-14.accesorios',
  
  // Niños - Niño 1-6
  'ninos.nino.1-6.ver-todo', 'ninos.nino.1-6.abrigos', 'ninos.nino.1-6.buzos', 'ninos.nino.1-6.camisetas',
  'ninos.nino.1-6.camisas', 'ninos.nino.1-6.jeans', 'ninos.nino.1-6.pantalones', 'ninos.nino.1-6.bermudas',
  'ninos.nino.1-6.conjuntos', 'ninos.nino.1-6.sweaters', 'ninos.nino.1-6.zapatos', 'ninos.nino.1-6.bolsos',
  'ninos.nino.1-6.pijamas', 'ninos.nino.1-6.accesorios',
  
  // Niños - Niño 6-14
  'ninos.nino.6-14.ver-todo', 'ninos.nino.6-14.abrigos', 'ninos.nino.6-14.buzos', 'ninos.nino.6-14.camisetas',
  'ninos.nino.6-14.camisas', 'ninos.nino.6-14.jeans', 'ninos.nino.6-14.pantalones', 'ninos.nino.6-14.bermudas',
  'ninos.nino.6-14.conjuntos', 'ninos.nino.6-14.sweaters', 'ninos.nino.6-14.trajes', 'ninos.nino.6-14.zapatos',
  'ninos.nino.6-14.bolsos', 'ninos.nino.6-14.accesorios',
  
  // Niños - Bebé 0-18m
  'ninos.bebe.0-18m.ver-todo', 'ninos.bebe.0-18m.tops', 'ninos.bebe.0-18m.pantalones', 'ninos.bebe.0-18m.monos-sets',
  'ninos.bebe.0-18m.zapatos', 'ninos.bebe.0-18m.accesorios'
];

// Category validation utilities
export interface CategoryUtils {
  isValidCategory(category: string): boolean;
  getCategoryHierarchy(category: ProductCategory): CategoryDisplayInfo[];
  getCategoryDisplayName(category: ProductCategory): string;
  getCategoryGender(category: ProductCategory): Gender | null;
  getCategoryAgeGroup(category: ProductCategory): AgeGroup | null;
  getSubcategories(parentCategory: string): ProductCategory[];
}