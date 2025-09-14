import { Request, Response } from 'express';
import { VariantService } from '../services/variant/variant.service';
import { catchAsync } from '../utils/catchAsync';
import { UpdateVariantDTO, CreateVariantDTO, VariantImage, BulkVariantUpdateDTO, BulkVariantRetrievalQuery } from '../types/variant.types';

export class VariantController {
  static getVariants = catchAsync(async (_req: Request, res: Response) => {
    const variants = await VariantService.getVariants();
    res.status(200).json({ total: variants.length, data: variants });
  });

  static getVariantById = catchAsync(async (req: Request, res: Response) => {
    const variantId = req.params.id;
    const variant = await VariantService.getVariantById(variantId);
    res.status(200).json({ data: variant });
  });

  static createVariant = catchAsync(async (req: Request, res: Response) => {
    const productId = req.params.id;
    const data: CreateVariantDTO = req.body;
    const result = await VariantService.createVariant(productId, data);
    res.status(201).json({ data: result });
  });

  static updateVariant = catchAsync(async (req: Request, res: Response) => {
    const variantId = req.params.id;
    const data: UpdateVariantDTO = req.body;
    const variant = await VariantService.updateVariant(variantId, data);
    res.status(200).json({ data: variant });
  });

  static deleteVariant = catchAsync(async (req: Request, res: Response) => {
    const variantId = req.params.id;
    await VariantService.deleteVariant(variantId);
    res.status(204).json({ status: 'success' });
  });

  static deleteVariantImage = catchAsync(async (req: Request, res: Response) => {
    const variantId = req.params.id;
    const key = req.body.key;
    const result = await VariantService.deleteVariantImage(variantId, key);
    res.status(200).json({ data: result });
  });

  static addVariantImage = catchAsync(async (req: Request, res: Response) => {
    const variantId = req.params.id;
    const data: VariantImage = req.body;
    const result = await VariantService.addImageToVariant(variantId, data);
    res.status(201).json({ data: result });
  });

  // Bulk operations
  static bulkUpdateVariants = catchAsync(async (req: Request, res: Response) => {
    const data: BulkVariantUpdateDTO = req.body;
    const result = await VariantService.bulkUpdateVariants(data);
    res.status(200).json({ data: result });
  });

  static getBulkVariants = catchAsync(async (req: Request, res: Response) => {
    const query: BulkVariantRetrievalQuery = {
      productIds: typeof req.query.productIds === 'string' 
        ? req.query.productIds.split(',') 
        : req.query.productIds as string[] || [],
      colors: typeof req.query.colors === 'string' 
        ? req.query.colors.split(',') 
        : req.query.colors as string[] || undefined,
      sizes: typeof req.query.sizes === 'string' 
        ? req.query.sizes.split(',') 
        : req.query.sizes as string[] || undefined,
      search: req.query.search as string,
      minStock: req.query.minStock ? Number(req.query.minStock) : undefined,
      maxStock: req.query.maxStock ? Number(req.query.maxStock) : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    };

    const variants = await VariantService.getBulkVariants(query);
    res.status(200).json({ total: variants.length, data: variants });
  });

  static getVariantsByProducts = catchAsync(async (req: Request, res: Response) => {
    const productIds = typeof req.query.productIds === 'string' 
      ? req.query.productIds.split(',') 
      : req.query.productIds as string[] || [];
    
    if (productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }

    const variants = await VariantService.getVariantsByProductIds(productIds);
    res.status(200).json({ total: variants.length, data: variants });
  });
}
