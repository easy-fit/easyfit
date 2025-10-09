import * as XLSX from 'xlsx';

interface ExportProductData {
  productId: string;
  productTitle: string;
  category: string;
  categoryKey: string;
  status: string;
  variantId: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  stock: number;
}

/**
 * Export products to Excel file
 * Creates one row per variant with columns: Producto, SKU, Talle, Color, Precio, Stock, Categoría, Estado
 */
export function exportProductsToExcel(
  products: ExportProductData[],
  storeName: string = 'productos'
): void {
  // Transform data to Excel rows
  const rows = products.map((item) => ({
    Producto: item.productTitle,
    SKU: item.sku,
    Talle: item.size,
    Color: item.color,
    Precio: item.price,
    Stock: item.stock,
    Categoría: item.category,
    Estado: item.status === 'published' ? 'Publicado' : item.status === 'draft' ? 'Borrador' : item.status,
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 30 }, // Producto
    { wch: 15 }, // SKU
    { wch: 10 }, // Talle
    { wch: 15 }, // Color
    { wch: 12 }, // Precio
    { wch: 10 }, // Stock
    { wch: 20 }, // Categoría
    { wch: 12 }, // Estado
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

  // Generate filename with current date
  const date = new Date().toISOString().split('T')[0];
  const filename = `productos_${storeName.toLowerCase().replace(/\s+/g, '_')}_${date}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
}
