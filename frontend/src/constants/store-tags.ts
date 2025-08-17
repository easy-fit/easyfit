// Store tags constants that match the backend validation
// These must match the backend STORE_TAGS_VALUES exactly

export const STORE_TAGS = {
  // Estilos
  urbana: 'urbana',
  elegante: 'elegante',
  clasica: 'clasica',
  minimalista: 'minimalista',
  deportiva: 'deportiva',
  streetwear: 'streetwear',
  bohemia: 'bohemia',
  vintage: 'vintage',
  oversize: 'oversize',
  basicos: 'basicos',

  // Categorías
  lenceria: 'lenceria',
  mujer: 'mujer',
  hombre: 'hombre',
  unisex: 'unisex',
  infantil: 'infantil',
  adolescente: 'adolescente',
  talles_grandes: 'talles_grandes',
  premama: 'premama',

  // Tipos de ropa
  ropa_casual: 'ropa_casual',
  ropa_deportiva: 'ropa_deportiva',
  ropa_formal: 'ropa_formal',
  ropa_para_eventos: 'ropa_para_eventos',
  ropa_interior: 'ropa_interior',
  ropa_exterior: 'ropa_exterior',
  calzado: 'calzado',
  accesorios: 'accesorios',
} as const;

export const STORE_TAGS_VALUES = Object.values(STORE_TAGS);

export type StoreTag = (typeof STORE_TAGS_VALUES)[number];

// Human-readable labels for the UI
export const STORE_TAG_LABELS: Record<StoreTag, string> = {
  // Estilos
  urbana: 'Urbana',
  elegante: 'Elegante',
  clasica: 'Clásica',
  minimalista: 'Minimalista',
  deportiva: 'Deportiva',
  streetwear: 'Streetwear',
  bohemia: 'Bohemia',
  vintage: 'Vintage',
  oversize: 'Oversize',
  basicos: 'Básicos',

  // Categorías
  lenceria: 'Lencería',
  mujer: 'Mujer',
  hombre: 'Hombre',
  unisex: 'Unisex',
  infantil: 'Infantil',
  adolescente: 'Adolescente',
  talles_grandes: 'Talles Grandes',
  premama: 'Premamá',

  // Tipos de ropa
  ropa_casual: 'Ropa Casual',
  ropa_deportiva: 'Ropa Deportiva',
  ropa_formal: 'Ropa Formal',
  ropa_para_eventos: 'Ropa para Eventos',
  ropa_interior: 'Ropa Interior',
  ropa_exterior: 'Ropa Exterior',
  calzado: 'Calzado',
  accesorios: 'Accesorios',
};

// Organized by categories for better UX
export const STORE_TAG_CATEGORIES = {
  estilos: {
    label: 'Estilos',
    tags: [
      'urbana',
      'elegante', 
      'clasica',
      'minimalista',
      'deportiva',
      'streetwear',
      'bohemia',
      'vintage',
      'oversize',
      'basicos',
    ] as StoreTag[],
  },
  categorias: {
    label: 'Categorías',
    tags: [
      'lenceria',
      'mujer',
      'hombre',
      'unisex',
      'infantil',
      'adolescente',
      'talles_grandes',
      'premama',
    ] as StoreTag[],
  },
  tipos: {
    label: 'Tipos de Ropa',
    tags: [
      'ropa_casual',
      'ropa_deportiva',
      'ropa_formal',
      'ropa_para_eventos',
      'ropa_interior',
      'ropa_exterior',
      'calzado',
      'accesorios',
    ] as StoreTag[],
  },
} as const;