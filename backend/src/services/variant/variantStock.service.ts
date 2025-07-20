import { VariantModel } from '../../models/variant.model';
import { AppError } from '../../utils/appError';

export class VariantStockService {
  static async checkStockAvailable(variantId: string, requestedQty: number) {
    const variant = await VariantModel.findById(variantId).select('stock').lean();
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }
    if (variant.stock < requestedQty) {
      throw new AppError('Not enough stock available', 400);
    }
    return true;
  }

  static async updateStock(variantId: string, newStock: number) {
    const variant = await VariantModel.findByIdAndUpdate(
      variantId,
      { stock: newStock },
      { new: true, runValidators: true },
    );

    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    return variant;
  }

  static async decreaseStock(variantId: string, quantity: number) {
    const variant = await VariantModel.findById(variantId);
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    if (variant.stock < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    variant.stock -= quantity;
    await variant.save();

    return variant;
  }

  static async increaseStock(variantId: string, quantity: number) {
    const variant = await VariantModel.findByIdAndUpdate(
      variantId,
      { $inc: { stock: quantity } },
      { new: true, runValidators: true },
    );

    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    return variant;
  }

  static async validateStockLevel(stock: number) {
    if (stock < 0) {
      throw new AppError('Stock cannot be negative', 400);
    }
    return true;
  }
}
