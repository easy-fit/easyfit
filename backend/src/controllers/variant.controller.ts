import { Request, Response } from 'express';
import { VariantService } from '../services/variant/variant.service';
import { catchAsync } from '../utils/catchAsync';
import { UpdateVariantDTO, CreateVariantDTO, VariantImage } from '../types/variant.types';

export class VariantController {
  static getVariants = catchAsync(async (_req: Request, res: Response) => {
    const variants = await VariantService.getVariants();
    res.status(200).json({ total: variants.length, variants });
  });

  static getVariantById = catchAsync(async (req: Request, res: Response) => {
    const variantId = req.params.id;
    const variant = await VariantService.getVariantById(variantId);
    res.status(200).json({ variant });
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
    res.status(200).json({ variant });
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
}
