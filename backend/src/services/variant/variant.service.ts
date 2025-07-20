import { VariantModel } from '../../models/variant.model';
import { AppError } from '../../utils/appError';
import { CreateVariantDTO, UpdateVariantDTO, VariantImage } from '../../types/variant.types';
import { VariantImageService } from './variantImage.service';
import { VariantStockService } from './variantStock.service';

export class VariantService {
  static async getVariants() {
    return VariantModel.find();
  }

  static async getVariantById(variantId: string) {
    const variant = await VariantModel.findById(variantId);
    this.ensureVariantExists(variant);
    return variant;
  }

  static async getVariantsByProductId(productId: string) {
    const variants = await VariantModel.find({ productId }).select('_id').lean();

    return variants.length > 0;
  }

  static async createVariant(productId: string, data: CreateVariantDTO) {
    const existingVariants = await VariantModel.find({ productId });
    if (existingVariants.length === 0) {
      data.isDefault = true;
    } else if (data.isDefault) {
      await VariantModel.updateMany({ productId, isDefault: true }, { $set: { isDefault: false } });
    }

    // Process images through VariantImageService and get signed URLs
    const imageProcessingResult = await VariantImageService.processVariantImages(data.images);
    const processedData = {
      ...data,
      images: imageProcessingResult.processedImages,
    };

    const variant = await VariantModel.create({
      ...processedData,
      productId,
    });

    return { variant, signedUrls: imageProcessingResult.signedUrls };
  }

  static async createManyVariants(productId: string, data: CreateVariantDTO[]) {
    let defaultIndex = data.findIndex((v) => v.isDefault);
    if (defaultIndex === -1) defaultIndex = 0;

    const variantsToInsert = data.map((variant, idx) => ({
      ...variant,
      productId,
      isDefault: idx === defaultIndex,
    }));

    return VariantModel.insertMany(variantsToInsert);
  }

  static async updateVariant(variantId: string, data: UpdateVariantDTO) {
    const variant = await VariantModel.findById(variantId);
    this.ensureVariantExists(variant);

    if (data.isDefault) {
      await VariantModel.updateMany({ productId: variant?.productId, isDefault: true }, { $set: { isDefault: false } });
    }

    // Validate stock if being updated
    if (data.stock !== undefined) {
      await VariantStockService.validateStockLevel(data.stock);
    }

    const updatedVariant = await VariantModel.findByIdAndUpdate(variantId, data, { new: true, runValidators: true });

    return updatedVariant;
  }

  static async deleteVariant(variantId: string) {
    const variant = await VariantModel.findByIdAndDelete(variantId);
    this.ensureVariantExists(variant);

    // Delete associated images
    const imageKeysToDelete = variant!.images.map((img) => img.key);
    if (imageKeysToDelete.length > 0) {
      VariantImageService.deleteVariantImages(imageKeysToDelete);
    }
  }

  // Stock management methods - delegated to VariantStockService
  static async checkStockAvailable(variantId: string, requestedQty: number) {
    return VariantStockService.checkStockAvailable(variantId, requestedQty);
  }

  static async checkStockAvailableForItems(cartItems: Array<{ variantId: string; quantity: number }>): Promise<boolean> {
    try {
      await Promise.all(
        cartItems.map(item => 
          VariantStockService.checkStockAvailable(item.variantId, item.quantity)
        )
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  static async updateStock(variantId: string, newStock: number) {
    return VariantStockService.updateStock(variantId, newStock);
  }

  static async decreaseStock(variantId: string, quantity: number) {
    return VariantStockService.decreaseStock(variantId, quantity);
  }

  static async increaseStock(variantId: string, quantity: number) {
    return VariantStockService.increaseStock(variantId, quantity);
  }

  // Image management methods - delegated to VariantImageService
  static async addImageToVariant(variantId: string, data: VariantImage) {
    return VariantImageService.addImageToVariant(variantId, data);
  }

  static async deleteVariantImage(variantId: string, key: string) {
    return VariantImageService.deleteVariantImage(variantId, key);
  }

  private static ensureVariantExists(variant: any): void {
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }
  }
}
