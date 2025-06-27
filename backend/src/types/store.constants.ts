// En store.constants.ts (nuevo archivo)
export const STORE_TAGS = {
  // Estilos
  URBANA: 'urbana',
  ELEGANTE: 'elegante',
  CLASICA: 'clasica',
  MINIMALISTA: 'minimalista',
  DEPORTIVA: 'deportiva',
  STREETWEAR: 'streetwear',
  BOHEMIA: 'bohemia',
  VINTAGE: 'vintage',
  OVERSIZE: 'oversize',
  BASICOS: 'basicos',

  // Categorías
  LENCERIA: 'lenceria',
  MUJER: 'mujer',
  HOMBRE: 'hombre',
  UNISEX: 'unisex',
  INFANTIL: 'infantil',
  ADOLESCENTE: 'adolescente',
  TALLES_GRANDES: 'talles_grandes',
  PREMAMA: 'premama',

  // Tipos de ropa
  ROPA_CASUAL: 'ropa_casual',
  ROPA_DEPORTIVA: 'ropa_deportiva',
  ROPA_FORMAL: 'ropa_formal',
  ROPA_PARA_EVENTOS: 'ropa_para_eventos',
  ROPA_INTERIOR: 'ropa_interior',
  ROPA_EXTERIOR: 'ropa_exterior',
  CALZADO: 'calzado',
  ACCESORIOS: 'accesorios',
} as const;

// Crear un array con todos los valores para facilitar la validación y recorrido
export const STORE_TAGS_VALUES = Object.values(STORE_TAGS);

// Definir el tipo en TypeScript usando typeof
export type StoreTag = (typeof STORE_TAGS_VALUES)[number];
