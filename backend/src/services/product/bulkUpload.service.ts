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
  ProductStatus
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

// Size mapping: numbers to size names
const SIZE_MAPPING: { [key: string]: string } = {
  '1': 'XS',
  '2': 'S',
  '3': 'M',
  '4': 'L',
  '5': 'XL',
  '6': 'XXL'
};

// Color name to hex mapping (Spanish color names)
const COLOR_NAME_MAPPING: { [key: string]: string } = {
  'negro': '#000000',
  'blanco': '#FFFFFF',
  'gris': '#808080',
  'azul': '#0000FF',
  'rojo': '#FF0000',
  'verde': '#008000',
  'amarillo': '#FFFF00',
  'rosa': '#FFC0CB',
  'violeta': '#8A2BE2',
  'naranja': '#FFA500',
  'marrón': '#A52A2A',
  'marron': '#A52A2A',
  'beige': '#F5F5DC',
  'terra': '#8E7368',
  'café': '#6F4E37',
  'cafe': '#6F4E37',
  'dorado': '#FFD700',
  'plateado': '#C0C0C0',
  'celeste': '#87CEEB',
  'marino': '#000080',
  'oliva': '#808000'
};

export class BulkUploadService {
  /**
   * Process size value - convert numbers to size names based on category
   */
  private static processSizeValue(sizeValue: string | number, category?: string): { size: string; warning?: string } {
    const sizeStr = String(sizeValue).trim();

    // For corseteria, preserve numeric values exactly as they are
    if (category === 'mujer.corseteria') {
      return { size: sizeStr };
    }

    // For other categories, check if it's a numeric mapping to clothing sizes
    if (SIZE_MAPPING[sizeStr]) {
      return { size: SIZE_MAPPING[sizeStr] };
    }

    // Check if it's already a valid size name
    const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'Único'];
    if (validSizes.includes(sizeStr.toUpperCase())) {
      return { size: sizeStr.toUpperCase() };
    }

    // If not recognized, return as-is with warning
    return {
      size: sizeStr,
      warning: `Size value '${sizeStr}' not recognized. Expected 1-6 or standard size names.`
    };
  }

  /**
   * Process color value - extract hex codes or map color names
   */
  private static processColorValue(colorValue: string): { color: string; warning?: string } {
    const colorStr = String(colorValue).trim().toLowerCase();

    // Check if it already contains a hex code (like "#8E7368 (Terra)")
    const hexMatch = colorStr.match(/#([0-9a-f]{6})/i);
    if (hexMatch) {
      return { color: hexMatch[0].toUpperCase() };
    }

    // Check if it's a color name we can map
    if (COLOR_NAME_MAPPING[colorStr]) {
      return { color: COLOR_NAME_MAPPING[colorStr] };
    }

    // Try to match partial color names in parentheses or combined strings
    for (const [colorName, hexCode] of Object.entries(COLOR_NAME_MAPPING)) {
      if (colorStr.includes(colorName)) {
        return { color: hexCode };
      }
    }

    // If not recognized, default to black with warning
    return {
      color: '#000000',
      warning: `Color '${colorValue}' not recognized. Defaulted to black. Please use hex codes or common color names.`
    };
  }

  static async processExcelFile(
    fileBuffer: Buffer,
    storeId: string
  ): Promise<BulkUploadResponse> {
    const response: BulkUploadResponse = {
      summary: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        productsCreated: 0,
        variantsCreated: 0,
        errors: 0
      },
      errors: [],
      warnings: []
    };

    try {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with expected headers
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: ''
      }) as any[][];

      if (rawData.length < 2) {
        throw new AppError('Excel file must contain headers and at least one data row', 400);
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
            warning: sizeResult.warning
          });
        }
        if (colorResult.warning) {
          response.warnings.push({
            row: rowNumber,
            warning: colorResult.warning
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
          SKU: String(row[headers.indexOf('SKU')] || '').trim()
        };

        const validationResult = this.validateRow(rowData, rowNumber);

        if (validationResult.isValid) {
          processedRows.push({
            ...rowData,
            rowNumber,
            isValid: true
          });
          response.summary.validRows++;
        } else {
          response.errors.push(...validationResult.errors);
          response.summary.invalidRows++;
        }
      }

      response.summary.errors = response.errors.length;

      // Check for duplicate SKUs within the file
      const skuMap = new Map<string, number>();
      for (const row of processedRows) {
        if (skuMap.has(row.SKU)) {
          response.errors.push({
            row: row.rowNumber,
            field: 'SKU',
            error: `Duplicate SKU '${row.SKU}' found in row ${skuMap.get(row.SKU)}`,
            data: row
          });
          continue;
        }
        skuMap.set(row.SKU, row.rowNumber);
      }

      // Check for existing SKUs in database
      const existingSkus = await this.checkExistingSkus(
        processedRows.map(r => r.SKU),
        storeId
      );

      for (const row of processedRows) {
        if (existingSkus.includes(row.SKU)) {
          response.errors.push({
            row: row.rowNumber,
            field: 'SKU',
            error: `SKU '${row.SKU}' already exists in your store`,
            data: row
          });
        }
      }

      // Filter out rows with errors
      const validRows = processedRows.filter(row =>
        !response.errors.some(error => error.row === row.rowNumber)
      );

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
              data: { TITLE: productGroup.title }
            });
          }
        }
      }

      return response;
    } catch (error) {
      throw new AppError(`Failed to process Excel file: ${error}`, 500);
    }
  }

  private static validateRow(
    row: BulkUploadRowDTO,
    rowNumber: number
  ): { isValid: boolean; errors: BulkUploadValidationError[] } {
    const errors: BulkUploadValidationError[] = [];

    // Required field validation
    if (!row.TITLE) {
      errors.push({
        row: rowNumber,
        field: 'TITLE',
        error: 'TITLE is required but empty',
        data: row
      });
    }

    if (!row.CATEGORY) {
      errors.push({
        row: rowNumber,
        field: 'CATEGORY',
        error: 'CATEGORY is required but empty',
        data: row
      });
    } else if (!PRODUCT_CATEGORY_VALUES.includes(row.CATEGORY as any)) {
      errors.push({
        row: rowNumber,
        field: 'CATEGORY',
        error: `Invalid category '${row.CATEGORY}'. Must be one of: ${PRODUCT_CATEGORY_VALUES.slice(0, 5).join(', ')}...`,
        data: row
      });
    }

    if (!row.SIZE) {
      errors.push({
        row: rowNumber,
        field: 'SIZE',
        error: 'SIZE is required but empty',
        data: row
      });
    }

    if (!row.COLOR) {
      errors.push({
        row: rowNumber,
        field: 'COLOR',
        error: 'COLOR is required but empty',
        data: row
      });
    }

    if (!row.SKU) {
      errors.push({
        row: rowNumber,
        field: 'SKU',
        error: 'SKU is required but empty',
        data: row
      });
    }

    // Price validation
    if (row.PRICE <= 0) {
      errors.push({
        row: rowNumber,
        field: 'PRICE',
        error: 'PRICE must be greater than 0',
        data: row
      });
    }

    // Stock validation
    if (row.STOCK < 0) {
      errors.push({
        row: rowNumber,
        field: 'STOCK',
        error: 'STOCK must be 0 or greater',
        data: row
      });
    }

    // Status validation
    if (row.STATUS && !['published', 'draft'].includes(row.STATUS)) {
      errors.push({
        row: rowNumber,
        field: 'STATUS',
        error: 'STATUS must be either "published" or "draft"',
        data: row
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static async checkExistingSkus(skus: string[], storeId: string): Promise<string[]> {
    const existingVariants = await VariantModel.find({
      sku: { $in: skus }
    }).populate({
      path: 'productId',
      match: { storeId }
    });

    return existingVariants
      .filter(v => v.productId)
      .map(v => v.sku);
  }

  private static groupByProduct(rows: ProcessedRow[]): ProductGroup[] {
    const groups: ProductGroup[] = [];
    let currentGroup: ProductGroup | null = null;

    for (const row of rows) {
      if (!currentGroup || currentGroup.title !== row.TITLE) {
        // Start new product group
        currentGroup = {
          title: row.TITLE,
          description: row.DESCRIPTION || '',
          category: row.CATEGORY,
          status: (row.STATUS as ProductStatus) || 'draft',
          variants: []
        };
        groups.push(currentGroup);
      }

      // Add variant to current group
      currentGroup.variants.push({
        size: row.SIZE,
        color: row.COLOR,
        price: row.PRICE,
        stock: row.STOCK,
        sku: row.SKU,
        rowNumber: row.rowNumber
      });
    }

    return groups;
  }

  private static async createProductWithVariants(
    productGroup: ProductGroup,
    storeId: string
  ): Promise<void> {
    // Validate title uniqueness
    await ProductValidationService.validateTitleUniqueness(storeId, productGroup.title);

    // Create product first
    const productData = {
      title: productGroup.title,
      description: productGroup.description,
      category: productGroup.category as any,
      status: productGroup.status,
      storeId,
      slug: ProductValidationService.generateSlug(productGroup.title)
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
      isBulk: false // Set to false since we're bypassing the bulk/non-bulk logic
    }));

    // Create variants directly using VariantService
    await VariantService.createManyVariants(product._id.toString(), variantData);
  }
}