import { Request, Response } from 'express';
import { VariantService } from '../services/variant.service';
import { catchAsync } from '../utils/catchAsync';
import { CreateVariantDTO, UpdateVariantDTO } from '../types/variant.types';

export class VariantController {
  static getVariants = catchAsync(async (_req: Request, res: Response) => {
    const variants = await VariantService.getVariants();
    res.status(200).json({ total: variants.length, variants });
  });

  static getVariantById = catchAsync(async (req: Request, res: Response) => {
    const variant = await VariantService.getVariantById(req.params.id);
    res.status(200).json({ variant });
  });

  static createVariant = catchAsync(async (req: Request, res: Response) => {
    const dto: CreateVariantDTO = req.body;
    const variant = await VariantService.createVariant(dto);
    res.status(201).json({ variant });
  });

  static updateVariant = catchAsync(async (req: Request, res: Response) => {
    const dto: UpdateVariantDTO = req.body;
    const variant = await VariantService.updateVariant(req.params.id, dto);
    res.status(200).json({ variant });
  });

  static deleteVariant = catchAsync(async (req: Request, res: Response) => {
    await VariantService.deleteVariant(req.params.id);
    res.status(204).json({ status: 'success' });
  });
}
