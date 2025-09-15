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

export const getSizeOptions = (category: string) => {
  // Jeans sizes for both hombre and mujer (waist-length format)
  if (category?.includes('jeans')) {
    return ['28-30', '30-30', '30-32', '32-30', '32-32', '34-32', '36-32', '38-32', '40-32'];
  }

  // Corsetería sizes (numeric format)
  if (category?.includes('corseteria')) {
    return ['80', '85', '90', '95', '100', '105', '110', '115', '120'];
  }

  // Shoe sizes for calzado categories
  if (category?.includes('calzado') || category?.includes('zapatillas') || category?.includes('zapatos')) {
    return ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  }

  // One size for accessories
  if (category?.includes('accesorios')) {
    return ['Único'];
  }

  // Baby sizes for baby categories
  if (category?.includes('bebe')) {
    return ['0-3m', '3-6m', '6-9m', '9-12m', '12-18m'];
  }

  // Standard clothing sizes for most other categories
  if (
    (category?.includes('hombre.') || category?.includes('mujer.') || category?.includes('ninos.')) &&
    !category?.includes('calzado') &&
    !category?.includes('zapatillas') &&
    !category?.includes('zapatos') &&
    !category?.includes('accesorios')
  ) {
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  }

  return [];
};
