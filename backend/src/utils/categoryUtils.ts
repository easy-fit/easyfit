import {
  ProductCategory,
  CategoryDisplayInfo,
  Gender,
  AgeGroup,
  HombreCategoryKeys,
  MujerCategoryKeys,
  UnisexCategoryKeys,
  NinaSubcategoryKeys,
  NinoSubcategoryKeys,
  NinoAdolescenteSubcategoryKeys,
  BebeCategoryKeys
} from '../types/category.types';

// Complete category configuration with display names
export const CATEGORY_CONFIG: Record<ProductCategory, CategoryDisplayInfo> = {
  // Hombre categories
  'hombre.ver-todo': { key: 'hombre.ver-todo', displayName: 'Ver Todo', gender: 'hombre', level: 'subcategory' },
  'hombre.abrigos': { key: 'hombre.abrigos', displayName: 'Abrigos', gender: 'hombre', level: 'subcategory' },
  'hombre.blazers': { key: 'hombre.blazers', displayName: 'Blazers', gender: 'hombre', level: 'subcategory' },
  'hombre.buzos': { key: 'hombre.buzos', displayName: 'Buzos', gender: 'hombre', level: 'subcategory' },
  'hombre.camisetas': { key: 'hombre.camisetas', displayName: 'Camisetas', gender: 'hombre', level: 'subcategory' },
  'hombre.camisas': { key: 'hombre.camisas', displayName: 'Camisas', gender: 'hombre', level: 'subcategory' },
  'hombre.deportivo': { key: 'hombre.deportivo', displayName: 'Deportivo', gender: 'hombre', level: 'subcategory' },
  'hombre.jeans': { key: 'hombre.jeans', displayName: 'Jeans', gender: 'hombre', level: 'subcategory' },
  'hombre.mochilas-bolsos': { key: 'hombre.mochilas-bolsos', displayName: 'Mochilas & Bolsos', gender: 'hombre', level: 'subcategory' },
  'hombre.pantalones': { key: 'hombre.pantalones', displayName: 'Pantalones', gender: 'hombre', level: 'subcategory' },
  'hombre.polos': { key: 'hombre.polos', displayName: 'Polos', gender: 'hombre', level: 'subcategory' },
  'hombre.bermudas': { key: 'hombre.bermudas', displayName: 'Bermudas', gender: 'hombre', level: 'subcategory' },
  'hombre.sobrecamisas': { key: 'hombre.sobrecamisas', displayName: 'Sobrecamisas', gender: 'hombre', level: 'subcategory' },
  'hombre.sweaters-cardigans': { key: 'hombre.sweaters-cardigans', displayName: 'Sweaters / Cardigans', gender: 'hombre', level: 'subcategory' },
  'hombre.trajes': { key: 'hombre.trajes', displayName: 'Trajes', gender: 'hombre', level: 'subcategory' },
  'hombre.zapatillas': { key: 'hombre.zapatillas', displayName: 'Zapatillas', gender: 'hombre', level: 'subcategory' },
  'hombre.zapatos': { key: 'hombre.zapatos', displayName: 'Zapatos', gender: 'hombre', level: 'subcategory' },
  'hombre.accesorios': { key: 'hombre.accesorios', displayName: 'Accesorios', gender: 'hombre', level: 'subcategory' },

  // Mujer categories
  'mujer.ver-todo': { key: 'mujer.ver-todo', displayName: 'Ver Todo', gender: 'mujer', level: 'subcategory' },
  'mujer.abrigos': { key: 'mujer.abrigos', displayName: 'Abrigos', gender: 'mujer', level: 'subcategory' },
  'mujer.blazers': { key: 'mujer.blazers', displayName: 'Blazers', gender: 'mujer', level: 'subcategory' },
  'mujer.buzos': { key: 'mujer.buzos', displayName: 'Buzos', gender: 'mujer', level: 'subcategory' },
  'mujer.calzas': { key: 'mujer.calzas', displayName: 'Calzas', gender: 'mujer', level: 'subcategory' },
  'mujer.camisetas-remeras': { key: 'mujer.camisetas-remeras', displayName: 'Camisetas / Remeras', gender: 'mujer', level: 'subcategory' },
  'mujer.camisas-blusas': { key: 'mujer.camisas-blusas', displayName: 'Camisas / Blusas', gender: 'mujer', level: 'subcategory' },
  'mujer.corseteria': { key: 'mujer.corseteria', displayName: 'Corsetería', gender: 'mujer', level: 'subcategory' },
  'mujer.deportivo': { key: 'mujer.deportivo', displayName: 'Deportivo', gender: 'mujer', level: 'subcategory' },
  'mujer.jeans': { key: 'mujer.jeans', displayName: 'Jeans', gender: 'mujer', level: 'subcategory' },
  'mujer.mallas': { key: 'mujer.mallas', displayName: 'Mallas', gender: 'mujer', level: 'subcategory' },
  'mujer.mochilas-bolsos-carteras': { key: 'mujer.mochilas-bolsos-carteras', displayName: 'Mochilas & Bolsos / Carteras', gender: 'mujer', level: 'subcategory' },
  'mujer.pantalones': { key: 'mujer.pantalones', displayName: 'Pantalones', gender: 'mujer', level: 'subcategory' },
  'mujer.pijamas': { key: 'mujer.pijamas', displayName: 'Pijamas', gender: 'mujer', level: 'subcategory' },
  'mujer.polleras-faldas': { key: 'mujer.polleras-faldas', displayName: 'Polleras / Faldas', gender: 'mujer', level: 'subcategory' },
  'mujer.shorts-bermudas': { key: 'mujer.shorts-bermudas', displayName: 'Shorts / Bermudas', gender: 'mujer', level: 'subcategory' },
  'mujer.sweaters-tejidos': { key: 'mujer.sweaters-tejidos', displayName: 'Sweaters / Tejidos', gender: 'mujer', level: 'subcategory' },
  'mujer.tops-bodies': { key: 'mujer.tops-bodies', displayName: 'Tops / Bodies', gender: 'mujer', level: 'subcategory' },
  'mujer.vestidos-monos': { key: 'mujer.vestidos-monos', displayName: 'Vestidos & Monos', gender: 'mujer', level: 'subcategory' },
  'mujer.trajes': { key: 'mujer.trajes', displayName: 'Trajes', gender: 'mujer', level: 'subcategory' },
  'mujer.zapatillas': { key: 'mujer.zapatillas', displayName: 'Zapatillas', gender: 'mujer', level: 'subcategory' },
  'mujer.zapatos': { key: 'mujer.zapatos', displayName: 'Zapatos', gender: 'mujer', level: 'subcategory' },
  'mujer.accesorios': { key: 'mujer.accesorios', displayName: 'Accesorios', gender: 'mujer', level: 'subcategory' },

  // Unisex categories
  'unisex.ver-todo': { key: 'unisex.ver-todo', displayName: 'Ver Todo', gender: 'unisex', level: 'subcategory' },
  'unisex.abrigos': { key: 'unisex.abrigos', displayName: 'Abrigos', gender: 'unisex', level: 'subcategory' },
  'unisex.blazers': { key: 'unisex.blazers', displayName: 'Blazers', gender: 'unisex', level: 'subcategory' },
  'unisex.buzos': { key: 'unisex.buzos', displayName: 'Buzos', gender: 'unisex', level: 'subcategory' },
  'unisex.camisetas': { key: 'unisex.camisetas', displayName: 'Camisetas', gender: 'unisex', level: 'subcategory' },
  'unisex.camisas': { key: 'unisex.camisas', displayName: 'Camisas', gender: 'unisex', level: 'subcategory' },
  'unisex.deportivo': { key: 'unisex.deportivo', displayName: 'Deportivo', gender: 'unisex', level: 'subcategory' },
  'unisex.jeans': { key: 'unisex.jeans', displayName: 'Jeans', gender: 'unisex', level: 'subcategory' },
  'unisex.mochilas-bolsos': { key: 'unisex.mochilas-bolsos', displayName: 'Mochilas & Bolsos', gender: 'unisex', level: 'subcategory' },
  'unisex.pantalones': { key: 'unisex.pantalones', displayName: 'Pantalones', gender: 'unisex', level: 'subcategory' },
  'unisex.sweaters': { key: 'unisex.sweaters', displayName: 'Sweaters', gender: 'unisex', level: 'subcategory' },
  'unisex.trajes': { key: 'unisex.trajes', displayName: 'Trajes', gender: 'unisex', level: 'subcategory' },
  'unisex.zapatillas': { key: 'unisex.zapatillas', displayName: 'Zapatillas', gender: 'unisex', level: 'subcategory' },
  'unisex.zapatos': { key: 'unisex.zapatos', displayName: 'Zapatos', gender: 'unisex', level: 'subcategory' },
  'unisex.accesorios': { key: 'unisex.accesorios', displayName: 'Accesorios', gender: 'unisex', level: 'subcategory' },

  // Niños - Niña 1½-6 años
  'ninos.nina.1-6.ver-todo': { key: 'ninos.nina.1-6.ver-todo', displayName: 'Ver Todo', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.abrigos': { key: 'ninos.nina.1-6.abrigos', displayName: 'Abrigos', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.buzos': { key: 'ninos.nina.1-6.buzos', displayName: 'Buzos', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.camisetas': { key: 'ninos.nina.1-6.camisetas', displayName: 'Camisetas', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.camisas': { key: 'ninos.nina.1-6.camisas', displayName: 'Camisas', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.jeans': { key: 'ninos.nina.1-6.jeans', displayName: 'Jeans', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.pantalones': { key: 'ninos.nina.1-6.pantalones', displayName: 'Pantalones', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.vestidos-monos': { key: 'ninos.nina.1-6.vestidos-monos', displayName: 'Vestidos y Monos', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.conjuntos': { key: 'ninos.nina.1-6.conjuntos', displayName: 'Conjuntos', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.faldas': { key: 'ninos.nina.1-6.faldas', displayName: 'Faldas', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.shorts': { key: 'ninos.nina.1-6.shorts', displayName: 'Shorts', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.sweaters': { key: 'ninos.nina.1-6.sweaters', displayName: 'Sweaters', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.zapatos': { key: 'ninos.nina.1-6.zapatos', displayName: 'Zapatos', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.bolsos': { key: 'ninos.nina.1-6.bolsos', displayName: 'Bolsos', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.pijamas': { key: 'ninos.nina.1-6.pijamas', displayName: 'Pijamas', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },
  'ninos.nina.1-6.accesorios': { key: 'ninos.nina.1-6.accesorios', displayName: 'Accesorios', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niña 1½-6 años' },

  // Niños - Niña 6-14 años
  'ninos.nina.6-14.ver-todo': { key: 'ninos.nina.6-14.ver-todo', displayName: 'Ver Todo', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.abrigos': { key: 'ninos.nina.6-14.abrigos', displayName: 'Abrigos', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.buzos': { key: 'ninos.nina.6-14.buzos', displayName: 'Buzos', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.camisetas': { key: 'ninos.nina.6-14.camisetas', displayName: 'Camisetas', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.camisas': { key: 'ninos.nina.6-14.camisas', displayName: 'Camisas', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.jeans': { key: 'ninos.nina.6-14.jeans', displayName: 'Jeans', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.pantalones': { key: 'ninos.nina.6-14.pantalones', displayName: 'Pantalones', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.vestidos-monos': { key: 'ninos.nina.6-14.vestidos-monos', displayName: 'Vestidos y Monos', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.conjuntos': { key: 'ninos.nina.6-14.conjuntos', displayName: 'Conjuntos', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.faldas': { key: 'ninos.nina.6-14.faldas', displayName: 'Faldas', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.shorts': { key: 'ninos.nina.6-14.shorts', displayName: 'Shorts', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.sweaters': { key: 'ninos.nina.6-14.sweaters', displayName: 'Sweaters', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.zapatos': { key: 'ninos.nina.6-14.zapatos', displayName: 'Zapatos', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.bolsos': { key: 'ninos.nina.6-14.bolsos', displayName: 'Bolsos', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.pijamas': { key: 'ninos.nina.6-14.pijamas', displayName: 'Pijamas', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },
  'ninos.nina.6-14.accesorios': { key: 'ninos.nina.6-14.accesorios', displayName: 'Accesorios', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niña 6-14 años' },

  // Niños - Niño 1½-6 años
  'ninos.nino.1-6.ver-todo': { key: 'ninos.nino.1-6.ver-todo', displayName: 'Ver Todo', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.abrigos': { key: 'ninos.nino.1-6.abrigos', displayName: 'Abrigos', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.buzos': { key: 'ninos.nino.1-6.buzos', displayName: 'Buzos', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.camisetas': { key: 'ninos.nino.1-6.camisetas', displayName: 'Camisetas', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.camisas': { key: 'ninos.nino.1-6.camisas', displayName: 'Camisas', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.jeans': { key: 'ninos.nino.1-6.jeans', displayName: 'Jeans', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.pantalones': { key: 'ninos.nino.1-6.pantalones', displayName: 'Pantalones', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.bermudas': { key: 'ninos.nino.1-6.bermudas', displayName: 'Bermudas', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.conjuntos': { key: 'ninos.nino.1-6.conjuntos', displayName: 'Conjuntos', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.sweaters': { key: 'ninos.nino.1-6.sweaters', displayName: 'Sweaters', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.zapatos': { key: 'ninos.nino.1-6.zapatos', displayName: 'Zapatos', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.bolsos': { key: 'ninos.nino.1-6.bolsos', displayName: 'Bolsos', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.pijamas': { key: 'ninos.nino.1-6.pijamas', displayName: 'Pijamas', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },
  'ninos.nino.1-6.accesorios': { key: 'ninos.nino.1-6.accesorios', displayName: 'Accesorios', gender: 'ninos', ageGroup: '1-6', level: 'subcategory', parentCategory: 'Niño 1½-6 años' },

  // Niños - Niño 6-14 años
  'ninos.nino.6-14.ver-todo': { key: 'ninos.nino.6-14.ver-todo', displayName: 'Ver Todo', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.abrigos': { key: 'ninos.nino.6-14.abrigos', displayName: 'Abrigos', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.buzos': { key: 'ninos.nino.6-14.buzos', displayName: 'Buzos', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.camisetas': { key: 'ninos.nino.6-14.camisetas', displayName: 'Camisetas', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.camisas': { key: 'ninos.nino.6-14.camisas', displayName: 'Camisas', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.jeans': { key: 'ninos.nino.6-14.jeans', displayName: 'Jeans', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.pantalones': { key: 'ninos.nino.6-14.pantalones', displayName: 'Pantalones', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.bermudas': { key: 'ninos.nino.6-14.bermudas', displayName: 'Bermudas', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.conjuntos': { key: 'ninos.nino.6-14.conjuntos', displayName: 'Conjuntos', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.sweaters': { key: 'ninos.nino.6-14.sweaters', displayName: 'Sweaters', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.trajes': { key: 'ninos.nino.6-14.trajes', displayName: 'Trajes', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.zapatos': { key: 'ninos.nino.6-14.zapatos', displayName: 'Zapatos', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.bolsos': { key: 'ninos.nino.6-14.bolsos', displayName: 'Bolsos', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },
  'ninos.nino.6-14.accesorios': { key: 'ninos.nino.6-14.accesorios', displayName: 'Accesorios', gender: 'ninos', ageGroup: '6-14', level: 'subcategory', parentCategory: 'Niño 6-14 años' },

  // Niños - Bebé 0-18 meses
  'ninos.bebe.0-18m.ver-todo': { key: 'ninos.bebe.0-18m.ver-todo', displayName: 'Ver Todo', gender: 'ninos', ageGroup: '0-18m', level: 'subcategory', parentCategory: 'Bebé (0-18 meses)' },
  'ninos.bebe.0-18m.tops': { key: 'ninos.bebe.0-18m.tops', displayName: 'Tops', gender: 'ninos', ageGroup: '0-18m', level: 'subcategory', parentCategory: 'Bebé (0-18 meses)' },
  'ninos.bebe.0-18m.pantalones': { key: 'ninos.bebe.0-18m.pantalones', displayName: 'Pantalones', gender: 'ninos', ageGroup: '0-18m', level: 'subcategory', parentCategory: 'Bebé (0-18 meses)' },
  'ninos.bebe.0-18m.monos-sets': { key: 'ninos.bebe.0-18m.monos-sets', displayName: 'Monos y Sets', gender: 'ninos', ageGroup: '0-18m', level: 'subcategory', parentCategory: 'Bebé (0-18 meses)' },
  'ninos.bebe.0-18m.zapatos': { key: 'ninos.bebe.0-18m.zapatos', displayName: 'Zapatos', gender: 'ninos', ageGroup: '0-18m', level: 'subcategory', parentCategory: 'Bebé (0-18 meses)' },
  'ninos.bebe.0-18m.accesorios': { key: 'ninos.bebe.0-18m.accesorios', displayName: 'Accesorios', gender: 'ninos', ageGroup: '0-18m', level: 'subcategory', parentCategory: 'Bebé (0-18 meses)' },
};

// Category utility functions
export class CategoryUtils {
  static isValidCategory(category: string): category is ProductCategory {
    return category in CATEGORY_CONFIG;
  }

  static getCategoryDisplayName(category: ProductCategory): string {
    return CATEGORY_CONFIG[category]?.displayName || category;
  }

  static getCategoryGender(category: ProductCategory): Gender | null {
    return CATEGORY_CONFIG[category]?.gender || null;
  }

  static getCategoryAgeGroup(category: ProductCategory): AgeGroup | null {
    return CATEGORY_CONFIG[category]?.ageGroup || null;
  }

  static getCategoryHierarchy(category: ProductCategory): CategoryDisplayInfo[] {
    const config = CATEGORY_CONFIG[category];
    if (!config) return [];

    const hierarchy: CategoryDisplayInfo[] = [];
    const parts = category.split('.');

    // Add main category (hombre/mujer/ninos)
    hierarchy.push({
      key: parts[0],
      displayName: this.getMainCategoryDisplayName(parts[0] as Gender),
      level: 'main'
    });

    // Add gender/age specific information for children
    if (parts[0] === 'ninos') {
      if (parts[1] === 'nina') {
        hierarchy.push({
          key: `${parts[0]}.${parts[1]}`,
          displayName: 'Niña',
          level: 'gender'
        });
      } else if (parts[1] === 'nino') {
        hierarchy.push({
          key: `${parts[0]}.${parts[1]}`,
          displayName: 'Niño',
          level: 'gender'
        });
      } else if (parts[1] === 'bebe') {
        hierarchy.push({
          key: `${parts[0]}.${parts[1]}`,
          displayName: 'Bebé',
          level: 'gender'
        });
      }

      // Add age group
      if (parts[2]) {
        hierarchy.push({
          key: `${parts[0]}.${parts[1]}.${parts[2]}`,
          displayName: this.getAgeGroupDisplayName(parts[2] as AgeGroup),
          level: 'age'
        });
      }
    }

    // Add subcategory
    hierarchy.push(config);

    return hierarchy;
  }

  static getMainCategoryDisplayName(gender: Gender): string {
    switch (gender) {
      case 'hombre': return 'Hombre';
      case 'mujer': return 'Mujer';
      case 'ninos': return 'Niños';
      case 'unisex': return 'Unisex';
      default: return gender;
    }
  }

  static getAgeGroupDisplayName(ageGroup: AgeGroup): string {
    switch (ageGroup) {
      case '1-6': return '1½ - 6 años';
      case '6-14': return '6 - 14 años';
      case '0-18m': return '0 - 18 meses';
      default: return ageGroup;
    }
  }

  static getSubcategories(parentCategory: string): ProductCategory[] {
    return Object.keys(CATEGORY_CONFIG).filter(category =>
      category.startsWith(parentCategory + '.')
    ) as ProductCategory[];
  }

  static getCategoriesByGender(gender: Gender): ProductCategory[] {
    return Object.keys(CATEGORY_CONFIG).filter(category =>
      CATEGORY_CONFIG[category as ProductCategory]?.gender === gender
    ) as ProductCategory[];
  }

  static getCategoriesByAgeGroup(ageGroup: AgeGroup): ProductCategory[] {
    return Object.keys(CATEGORY_CONFIG).filter(category =>
      CATEGORY_CONFIG[category as ProductCategory]?.ageGroup === ageGroup
    ) as ProductCategory[];
  }

  static getAllCategories(): ProductCategory[] {
    return Object.keys(CATEGORY_CONFIG) as ProductCategory[];
  }

  static getCategoryTree() {
    const tree = {
      hombre: {} as Record<string, CategoryDisplayInfo>,
      mujer: {} as Record<string, CategoryDisplayInfo>,
      unisex: {} as Record<string, CategoryDisplayInfo>,
      ninos: {
        nina: {
          '1-6': {} as Record<string, CategoryDisplayInfo>,
          '6-14': {} as Record<string, CategoryDisplayInfo>
        },
        nino: {
          '1-6': {} as Record<string, CategoryDisplayInfo>,
          '6-14': {} as Record<string, CategoryDisplayInfo>
        },
        bebe: {
          '0-18m': {} as Record<string, CategoryDisplayInfo>
        }
      }
    };

    Object.entries(CATEGORY_CONFIG).forEach(([key, config]) => {
      const parts = key.split('.');

      if (parts[0] === 'hombre') {
        tree.hombre[parts[1]] = config;
      } else if (parts[0] === 'mujer') {
        tree.mujer[parts[1]] = config;
      } else if (parts[0] === 'unisex') {
        tree.unisex[parts[1]] = config;
      } else if (parts[0] === 'ninos') {
        const childGender = parts[1] as 'nina' | 'nino' | 'bebe';
        const ageGroup = parts[2] as '1-6' | '6-14' | '0-18m';
        const subcategory = parts[3];
        
        if (childGender === 'bebe') {
          tree.ninos.bebe['0-18m'][subcategory] = config;
        } else if (childGender === 'nina' || childGender === 'nino') {
          // Type guard to ensure ageGroup is correct for nina/nino
          if (ageGroup === '1-6' || ageGroup === '6-14') {
            tree.ninos[childGender][ageGroup][subcategory] = config;
          }
        }
      }
    });

    return tree;
  }
}