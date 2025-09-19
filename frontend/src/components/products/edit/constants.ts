export const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'deleted', label: 'Archivado' },
];

export const commonColors = [
  { name: 'Negro', value: '#000000' },
  { name: 'Blanco', value: '#FFFFFF' },
  { name: 'Gris', value: '#808080' },
  { name: 'Azul', value: '#0000FF' },
  { name: 'Rojo', value: '#FF0000' },
  { name: 'Verde', value: '#008000' },
  { name: 'Amarillo', value: '#FFFF00' },
  { name: 'Rosa', value: '#FFC0CB' },
  { name: 'Violeta', value: '#8A2BE2' },
  { name: 'Naranja', value: '#FFA500' },
  { name: 'Marrón', value: '#A52A2A' },
  { name: 'Beige', value: '#F5F5DC' },
];

export const sizesByCategory = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  accessories: ['Único'],
  baby: ['0-3m', '3-6m', '6-9m', '9-12m', '12-18m'],
  corseteria: [], // Empty array - corseteria uses custom numeric sizes
};

export const getSizesForCategory = (category: string): string[] => {
  if (!category) return [];

  // Check for corseteria (bras) - should use custom numeric sizes
  if (category === 'mujer.corseteria') {
    return sizesByCategory.corseteria; // Returns empty array to allow custom input
  }

  // Check for clothing categories
  if ((category.includes('hombre.') || category.includes('mujer.') || category.includes('ninos.'))
      && !category.includes('zapatos') && !category.includes('accesorios')) {
    return sizesByCategory.clothing;
  }

  // Check for shoe categories
  if (category.includes('zapatos')) {
    return sizesByCategory.shoes;
  }

  // Check for accessory categories
  if (category.includes('accesorios')) {
    return sizesByCategory.accessories;
  }

  // Check for baby categories
  if (category.includes('bebe')) {
    return sizesByCategory.baby;
  }

  return [];
};