import { VariantModel } from '../../models/variant.model';
import { AppError } from '../../utils/appError';
import { CreateVariantDTO, UpdateVariantDTO, VariantImage, BulkVariantUpdateDTO, BulkVariantUpdateResponse, BulkVariantRetrievalQuery } from '../../types/variant.types';
import { VariantImageService } from './variantImage.service';
import { VariantStockService } from './variantStock.service';
import { ProductModel } from '../../models/product.model';

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

  // Bulk operations
  static async bulkUpdateVariants(data: BulkVariantUpdateDTO): Promise<BulkVariantUpdateResponse> {
    const { updates } = data;
    const response: BulkVariantUpdateResponse = {
      successful: 0,
      failed: 0,
      errors: [],
      updatedVariants: []
    };

    // Process updates in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (update) => {
        try {
          // Validate stock if being updated
          if (update.stock !== undefined) {
            await VariantStockService.validateStockLevel(update.stock);
          }

          const variant = await VariantModel.findByIdAndUpdate(
            update.variantId,
            {
              ...(update.stock !== undefined && { stock: update.stock }),
              ...(update.price !== undefined && { price: update.price }),
              ...(update.sku !== undefined && { sku: update.sku })
            },
            { new: true, runValidators: true }
          );

          if (!variant) {
            response.failed++;
            response.errors.push({
              variantId: update.variantId,
              error: 'Variant not found'
            });
            return;
          }

          response.successful++;
          response.updatedVariants.push(variant.toObject());
        } catch (error) {
          response.failed++;
          response.errors.push({
            variantId: update.variantId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }));
    }

    return response;
  }

  static async getBulkVariants(query: BulkVariantRetrievalQuery) {
    const { productIds, colors, sizes, search, minStock, maxStock, minPrice, maxPrice } = query;

    // Build the MongoDB filter
    const filter: any = {};
    
    if (productIds && productIds.length > 0) {
      filter.productId = { $in: productIds };
    }

    if (colors && colors.length > 0) {
      filter.color = { $in: colors };
    }

    if (sizes && sizes.length > 0) {
      filter.size = { $in: sizes };
    }

    if (search) {
      filter.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
        { size: { $regex: search, $options: 'i' } }
      ];
    }

    if (minStock !== undefined || maxStock !== undefined) {
      filter.stock = {};
      if (minStock !== undefined) filter.stock.$gte = minStock;
      if (maxStock !== undefined) filter.stock.$lte = maxStock;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Populate product information
    const variants = await VariantModel.find(filter)
      .populate({
        path: 'productId',
        select: 'title slug category storeId',
        populate: {
          path: 'storeId',
          select: 'name slug'
        }
      })
      .sort({ productId: 1, color: 1, size: 1 })
      .lean();

    return variants;
  }

  static async getVariantsByProductIds(productIds: string[]) {
    return VariantModel.find({ productId: { $in: productIds } })
      .populate({
        path: 'productId',
        select: 'title slug category'
      })
      .sort({ productId: 1, isDefault: -1, color: 1, size: 1 });
  }

  private static ensureVariantExists(variant: any): void {
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }
  }
}
