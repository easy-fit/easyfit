import * as XLSX from 'xlsx';
import { ProductService } from './product.service';
import { ProductValidationService } from './productValidation.service';
import { VariantService } from '../variant/variant.service';
import { ProductModel } from '../../models/product.model';
import { AppError } from '../../utils/appError';
import { PRODUCT_CATEGORY_VALUES } from '../../types/category.types';
import {
  BulkUploadRowDTO,
  BulkUploadResponse,
  BulkUploadValidationError,
  CreateProductDTO,
  ProductStatus,
} from '../../types/product.types';
import { CreateVariantDTO } from '../../types/variant.types';
import { VariantModel } from '../../models/variant.model';

interface ProcessedRow extends BulkUploadRowDTO {
  rowNumber: number;
  isValid: boolean;
}

interface ProductGroup {
  title: string;
  description: string;
  category: string;
  status: ProductStatus;
  variants: Array<{
    size: string;
    color: string;
    price: number;
    stock: number;
    sku: string;
    rowNumber: number;
  }>;
}

// Color name to hex mapping (Spanish color names - extended)
const COLOR_NAME_MAPPING: { [key: string]: string } = {
  // Basic colors
  negro: '#000000',
  blanco: '#FFFFFF',
  gris: '#808080',
  'gris oscuro': '#A9A9A9',
  'gris claro': '#D3D3D3',
  azul: '#0000FF',
  'azul marino': '#000080',
  'azul cielo': '#87CEEB',
  'azul oscuro': '#00008B',
  'azul claro': '#ADD8E6',
  rojo: '#FF0000',
  'rojo oscuro': '#8B0000',
  verde: '#008000',
  'verde oscuro': '#006400',
  'verde claro': '#90EE90',
  amarillo: '#FFFF00',
  rosa: '#FFC0CB',
  'rosa claro': '#FFB6C1',
  'rosa oscuro': '#FF1493',
  violeta: '#8A2BE2',
  púrpura: '#800080',
  purpura: '#800080',
  naranja: '#FFA500',

  // Browns and earth tones
  marrón: '#A52A2A',
  marron: '#A52A2A',
  café: '#6F4E37',
  cafe: '#6F4E37',
  caramelo: '#AF6E4D',
  chocolate: '#D2691E',
  tierra: '#8E7368',
  terra: '#8E7368',
  terracota: '#E2725B',
  arena: '#C2B280',
  tostado: '#D2B48C',
  beige: '#F5F5DC',
  crema: '#FFFDD0',
  camel: '#C19A6B',
  cognac: '#9A463D',
  cuero: '#8B4513',

  // Metallics
  dorado: '#FFD700',
  oro: '#FFD700',
  plateado: '#C0C0C0',
  plata: '#C0C0C0',
  bronce: '#CD7F32',
  cobre: '#B87333',

  // Blues
  celeste: '#87CEEB',
  marino: '#000080',
  turquesa: '#40E0D0',
  aguamarina: '#7FFFD4',
  índigo: '#4B0082',
  indigo: '#4B0082',
  navy: '#000080',
  cobalto: '#0047AB',
  petróleo: '#2B5F75',
  petroleo: '#2B5F75',

  // Greens
  oliva: '#808000',
  lima: '#00FF00',
  menta: '#98FF98',
  esmeralda: '#50C878',
  jade: '#00A86B',
  'verde militar': '#4B5320',
  'verde musgo': '#8A9A5B',
  'verde botella': '#006A4E',

  // Reds/Pinks
  carmesí: '#DC143C',
  carmesi: '#DC143C',
  burdeos: '#800020',
  borgoña: '#800020',
  borgona: '#800020',
  coral: '#FF7F50',
  salmón: '#FA8072',
  salmon: '#FA8072',
  fucsia: '#FF00FF',
  magenta: '#FF00FF',
  cereza: '#990000',
  vino: '#722F37',

  // Neutrals
  hueso: '#F9F6EE',
  marfil: '#FFFFF0',
  perla: '#EAE0C8',
  avena: '#E8D5C4',
  taupe: '#B38B6D',
  grafito: '#383838',
  carbón: '#36454F',
  carbon: '#36454F',

  // Others
  lavanda: '#E6E6FA',
  lila: '#C8A2C8',
  mostaza: '#FFDB58',
  ocre: '#CC7722',
  durazno: '#FFDAB9',
  melocotón: '#FFDAB9',
  melocoton: '#FFDAB9',
  melón: '#FEBAAD',
  melon: '#FEBAAD',
  almendra: '#EFDECD',

  // Fashion/Brand specific colors
  fuccia: '#FF00FF',
  aero: '#7CB9E8',
  natural: '#F5F5DC',
  'gris melange': '#B8B8B8',
  melange: '#B8B8B8',
};

export class BulkUploadService {
  /**
   * Process size value - preserve exactly as provided in Excel
   */
  private static processSizeValue(sizeValue: string | number, category?: string): { size: string; warning?: string } {
    // Simply trim and return the size value as-is from the Excel file
    const sizeStr = String(sizeValue).trim();
    return { size: sizeStr };
  }

  /**
   * Process color value - extract hex codes or map color names
   * Supports:
   * 1. Direct hex codes: #RRGGBB or #RGB
   * 2. Hex with description: "#8E7368 (Terra)"
   * 3. Spanish color names (custom mapping)
   * 4. Partial matches in compound names
   */
  private static processColorValue(colorValue: string): { color: string; warning?: string } {
    const colorStr = String(colorValue).trim();
    const colorLower = colorStr.toLowerCase();

    // 1. Check if it already contains a hex code (like "#8E7368" or "#8E7368 (Terra)")
    const hexMatch = colorStr.match(/#([0-9a-f]{6}|[0-9a-f]{3})/i);
    if (hexMatch) {
      let hex = hexMatch[1];
      // Convert 3-digit hex to 6-digit
      if (hex.length === 3) {
        hex = hex
          .split('')
          .map((c) => c + c)
          .join('');
      }
      return { color: '#' + hex.toUpperCase() };
    }

    // 2. Check Spanish color name mappings (exact match)
    if (COLOR_NAME_MAPPING[colorLower]) {
      return { color: COLOR_NAME_MAPPING[colorLower] };
    }

    // 3. Try to match partial Spanish color names in compound strings
    for (const [colorName, hexCode] of Object.entries(COLOR_NAME_MAPPING)) {
      if (colorLower.includes(colorName)) {
        return { color: hexCode };
      }
    }

    // If not recognized, default to black with warning
    return {
      color: '#000000',
      warning: `Color '${colorValue}' not recognized. Defaulted to black. Please use hex codes (e.g., #FF0000) or common color names.`,
    };
  }

  static async processExcelFile(fileBuffer: Buffer, storeId: string): Promise<BulkUploadResponse> {
    const response: BulkUploadResponse = {
      summary: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        productsCreated: 0,
        variantsCreated: 0,
        errors: 0,
      },
      errors: [],
      warnings: [],
    };

    try {
      // Parse Excel or CSV file (XLSX library handles both formats)
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with expected headers
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      }) as any[][];

      if (rawData.length < 2) {
        throw new AppError('File must contain headers and at least one data row', 400);
      }

      // Validate headers
      const expectedHeaders = ['TITLE', 'DESCRIPTION', 'CATEGORY', 'STATUS', 'SIZE', 'COLOR', 'PRICE', 'STOCK', 'SKU'];
      const headers = rawData[0] as string[];

      for (const expectedHeader of expectedHeaders) {
        if (!headers.includes(expectedHeader)) {
          throw new AppError(`Missing required column: ${expectedHeader}`, 400);
        }
      }

      // Process data rows
      const dataRows = rawData.slice(1);
      response.summary.totalRows = dataRows.length;

      // Convert rows to objects and validate
      const processedRows: ProcessedRow[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowNumber = i + 2; // +2 because index starts at 0 and we skip header

        // Get category for size processing
        const category = String(row[headers.indexOf('CATEGORY')] || '').trim();

        // Process size and color values
        const sizeResult = this.processSizeValue(row[headers.indexOf('SIZE')] || '', category);
        const colorResult = this.processColorValue(row[headers.indexOf('COLOR')] || '');

        // Add warnings if any
        if (sizeResult.warning) {
          response.warnings.push({
            row: rowNumber,
            warning: sizeResult.warning,
          });
        }
        if (colorResult.warning) {
          response.warnings.push({
            row: rowNumber,
            warning: colorResult.warning,
          });
        }

        const rowData: BulkUploadRowDTO = {
          TITLE: String(row[headers.indexOf('TITLE')] || '').trim(),
          DESCRIPTION: String(row[headers.indexOf('DESCRIPTION')] || '').trim(),
          CATEGORY: String(row[headers.indexOf('CATEGORY')] || '').trim(),
          STATUS: String(row[headers.indexOf('STATUS')] || '').trim(),
          SIZE: sizeResult.size, // Use processed size
          COLOR: colorResult.color, // Use processed color
          PRICE: Number(row[headers.indexOf('PRICE')]) || 0,
          STOCK: Number(row[headers.indexOf('STOCK')]) || 0,
          SKU: String(row[headers.indexOf('SKU')] || '').trim(),
        };

        const validationResult = this.validateRow(rowData, rowNumber);

        if (validationResult.isValid) {
          processedRows.push({
            ...rowData,
            rowNumber,
            isValid: true,
          });
          response.summary.validRows++;
        } else {
          response.errors.push(...validationResult.errors);
          response.summary.invalidRows++;
        }
      }

      response.summary.errors = response.errors.length;

      // Auto-fix duplicate SKUs within the file by appending a suffix
      const skuMap = new Map<string, number>();
      const skuCounters = new Map<string, number>();

      for (const row of processedRows) {
        const originalSku = row.SKU;

        if (skuMap.has(row.SKU)) {
          // SKU already exists - generate a unique one
          const counter = (skuCounters.get(originalSku) || 1) + 1;
          skuCounters.set(originalSku, counter);
          row.SKU = `${originalSku}-${counter}`;

          response.warnings.push({
            row: row.rowNumber,
            warning: `Duplicate SKU '${originalSku}' auto-fixed to '${row.SKU}'`,
          });
        }

        skuMap.set(row.SKU, row.rowNumber);

        // Initialize counter for this SKU
        if (!skuCounters.has(originalSku)) {
          skuCounters.set(originalSku, 1);
        }
      }

      // Check for existing SKUs in database
      const existingSkus = await this.checkExistingSkus(
        processedRows.map((r) => r.SKU),
        storeId,
      );

      for (const row of processedRows) {
        if (existingSkus.includes(row.SKU)) {
          response.errors.push({
            row: row.rowNumber,
            field: 'SKU',
            error: `SKU '${row.SKU}' already exists in your store`,
            data: row,
          });
        }
      }

      // Filter out rows with errors
      const validRows = processedRows.filter((row) => !response.errors.some((error) => error.row === row.rowNumber));

      // Group rows by product title
      const productGroups = this.groupByProduct(validRows);

      // Create products and variants
      for (const productGroup of productGroups) {
        try {
          await this.createProductWithVariants(productGroup, storeId);
          response.summary.productsCreated++;
          response.summary.variantsCreated += productGroup.variants.length;
        } catch (error) {
          // Add errors for all variants in this product group
          for (const variant of productGroup.variants) {
            response.errors.push({
              row: variant.rowNumber,
              field: 'GENERAL',
              error: `Failed to create product '${productGroup.title}': ${error}`,
              data: { TITLE: productGroup.title },
            });
          }
        }
      }

      return response;
    } catch (error) {
      throw new AppError(`Failed to process file: ${error}`, 500);
    }
  }

  private static validateRow(
    row: BulkUploadRowDTO,
    rowNumber: number,
  ): { isValid: boolean; errors: BulkUploadValidationError[] } {
    const errors: BulkUploadValidationError[] = [];

    // Required field validation
    if (!row.TITLE) {
      errors.push({
        row: rowNumber,
        field: 'TITLE',
        error: 'TITLE is required but empty',
        data: row,
      });
    }

    if (!row.CATEGORY) {
      errors.push({
        row: rowNumber,
        field: 'CATEGORY',
        error: 'CATEGORY is required but empty',
        data: row,
      });
    } else if (!PRODUCT_CATEGORY_VALUES.includes(row.CATEGORY as any)) {
      errors.push({
        row: rowNumber,
        field: 'CATEGORY',
        error: `Invalid category '${row.CATEGORY}'. Must be one of: ${PRODUCT_CATEGORY_VALUES.slice(0, 5).join(
          ', ',
        )}...`,
        data: row,
      });
    }

    if (!row.SIZE) {
      errors.push({
        row: rowNumber,
        field: 'SIZE',
        error: 'SIZE is required but empty',
        data: row,
      });
    }

    if (!row.COLOR) {
      errors.push({
        row: rowNumber,
        field: 'COLOR',
        error: 'COLOR is required but empty',
        data: row,
      });
    }

    if (!row.SKU) {
      errors.push({
        row: rowNumber,
        field: 'SKU',
        error: 'SKU is required but empty',
        data: row,
      });
    }

    // Price validation
    if (row.PRICE <= 0) {
      errors.push({
        row: rowNumber,
        field: 'PRICE',
        error: 'PRICE must be greater than 0',
        data: row,
      });
    }

    // Stock validation
    if (row.STOCK < 0) {
      errors.push({
        row: rowNumber,
        field: 'STOCK',
        error: 'STOCK must be 0 or greater',
        data: row,
      });
    }

    // Status validation
    if (row.STATUS && !['published', 'draft'].includes(row.STATUS)) {
      errors.push({
        row: rowNumber,
        field: 'STATUS',
        error: 'STATUS must be either "published" or "draft"',
        data: row,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static async checkExistingSkus(skus: string[], storeId: string): Promise<string[]> {
    const existingVariants = await VariantModel.find({
      sku: { $in: skus },
    }).populate({
      path: 'productId',
      match: { storeId },
    });

    return existingVariants.filter((v) => v.productId).map((v) => v.sku);
  }

  private static groupByProduct(rows: ProcessedRow[]): ProductGroup[] {
    // Use a Map to group all rows by DESCRIPTION (which will be used as title)
    // This handles non-consecutive rows with the same product correctly
    const groupsMap = new Map<string, ProductGroup>();

    for (const row of rows) {
      // Use DESCRIPTION as the unique key since it becomes the product title
      const key = (row.DESCRIPTION || '').trim();

      if (!key) continue; // Skip rows without description

      if (!groupsMap.has(key)) {
        // Create new product group
        groupsMap.set(key, {
          title: row.TITLE,
          description: row.DESCRIPTION || '',
          category: row.CATEGORY,
          status: (row.STATUS as ProductStatus) || 'draft',
          variants: [],
        });
      }

      // Add variant to the group
      const group = groupsMap.get(key)!;
      group.variants.push({
        size: row.SIZE,
        color: row.COLOR,
        price: row.PRICE,
        stock: row.STOCK,
        sku: row.SKU,
        rowNumber: row.rowNumber,
      });
    }

    // Convert Map to Array
    return Array.from(groupsMap.values());
  }

  private static async createProductWithVariants(productGroup: ProductGroup, storeId: string): Promise<void> {
    // Use DESCRIPTION as title (which contains the full product name)
    // This ensures uniqueness since each product has a different description
    const productTitle = productGroup.description || productGroup.title;

    // Validate title uniqueness
    await ProductValidationService.validateTitleUniqueness(storeId, productTitle);

    // Create product first
    const productData = {
      title: productTitle,
      description: productGroup.description,
      category: productGroup.category as any,
      status: productGroup.status,
      storeId,
      slug: ProductValidationService.generateSlug(productTitle),
    };

    // Create the product directly
    const product = await ProductModel.create(productData);

    // Create variant data (no images for bulk upload)
    const variantData: CreateVariantDTO[] = productGroup.variants.map((variant, index) => ({
      size: variant.size,
      color: variant.color,
      price: variant.price,
      stock: variant.stock,
      sku: variant.sku,
      images: [], // No images in bulk upload
      isDefault: index === 0, // First variant is default
      isBulk: false, // Set to false since we're bypassing the bulk/non-bulk logic
    }));

    // Create variants directly using VariantService
    await VariantService.createManyVariants(product._id.toString(), variantData);
  }
}
