import { VariantModel } from '../models/variant.model';
import { AppError } from '../utils/appError';
import { CreateVariantDTO, UpdateVariantDTO } from '../types/variant.types';

export class VariantService {
  static async getVariants() {
    return VariantModel.find();
  }

  static async getVariantById(variantId: string) {
    const variant = await VariantModel.findById(variantId);
    this.ensureVariantExists(variant);
    return variant;
  }

  static async createVariant(data: CreateVariantDTO) {
    return VariantModel.create(data);
  }

  static async updateVariant(variantId: string, updates: UpdateVariantDTO) {
    const variant = await VariantModel.findByIdAndUpdate(variantId, updates, {
      new: true,
    });

    this.ensureVariantExists(variant);

    return variant;
  }

  static async deleteVariant(variantId: string) {
    const variant = await VariantModel.findByIdAndDelete(variantId);
    this.ensureVariantExists(variant);
  }

  static async checkStockAvailable(variantId: string, requestedQty: number) {
    const variant = await VariantModel.findById(variantId).select('stock');
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }
    if (variant.stock < requestedQty) {
      throw new AppError('Not enough stock available', 400);
    }
  }

  private static ensureVariantExists(variant: any): void {
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }
  }
}
