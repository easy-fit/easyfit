import { Types } from 'mongoose';
import { ProductModel } from '../../models/product.model';
import { AppError } from '../../utils/appError';
import { CreateProductDTO, UpdateProductDTO, ProductFilterOptions } from '../../types/product.types';
import { CreateVariantDTO } from '../../types/variant.types';
import { VariantService } from '../variant/variant.service';
import { ProductFilterService } from './productFilter.service';
import { ProductValidationService } from './productValidation.service';
import { R2Service } from '../r2.service';
import { R2 } from '../../config/env';

export class ProductService {
  static async getProducts(options: ProductFilterOptions = {}) {
    return ProductFilterService.getFilteredProducts(options);
  }

  static async getProductById(productId: string) {
    const result = await ProductModel.aggregate([
      { $match: { _id: new Types.ObjectId(productId) } },
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
    ]);

    if (!result || result.length === 0) {
      throw new AppError('Product not found', 404);
    }

    return result[0];
  }

  static async getProductsByStore(storeSlug: string) {
    const products = await ProductFilterService.getProductsByStore(storeSlug);

    if (!products || products.length === 0) {
      throw new AppError('No products found for this store', 404);
    }

    return products;
  }

  static async getProductBySlug(storeSlug: string, slug: string) {
    const product = await ProductFilterService.getProductBySlug(storeSlug, slug);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  static async createProduct(data: CreateProductDTO, variants: CreateVariantDTO[], storeId: string) {
    await ProductValidationService.validateTitleUniqueness(storeId, data.title);

    const slug = ProductValidationService.generateSlug(data.title);
    const enhancedData = { ...data, storeId, slug };
    const product = await ProductModel.create(enhancedData);

    // Separate bulk and non-bulk variants
    const nonBulkVariants = variants.filter((variant) => !variant.isBulk);
    const bulkVariants = variants.filter((variant) => variant.isBulk);

    // Process images only for non-bulk variants
    const images = nonBulkVariants.flatMap((variant) =>
      variant.images.map((img) => ({
        key: img.key,
        contentType: img.contentType || 'image/jpeg',
      })),
    );

    // Get signed URLs only for non-bulk variant images
    const signedUrls = images.length > 0 
      ? await R2Service.getSignedUrls({
          bucket: R2.BUCKET_PRODUCTS,
          typePrefix: 'products',
          files: images,
        })
      : [];

    // Process non-bulk variants with signed URLs
    let currentSignedUrlIndex = 0;
    const processedNonBulkVariants = nonBulkVariants.map((variant) => {
      const imagesWithSignedUrls = variant.images.map((img) => {
        const signedUrlIndex = currentSignedUrlIndex;
        currentSignedUrlIndex++;

        return {
          ...img,
          key: signedUrls[signedUrlIndex].key_img,
        };
      });

      return { ...variant, images: imagesWithSignedUrls };
    });

    // Process bulk variants - copy image keys from parent variant (same color)
    const processedBulkVariants = bulkVariants.map((bulkVariant) => {
      // Find the parent variant with the same color (non-bulk)
      const parentVariant = processedNonBulkVariants.find((variant) => variant.color === bulkVariant.color);

      if (!parentVariant) {
        throw new AppError(`Parent variant not found for bulk variant with color: ${bulkVariant.color}`, 400);
      }

      // Copy image keys from parent variant
      const copiedImages = parentVariant.images.map((parentImg) => ({
        ...parentImg,
        // Keep the same key to reference the same image in R2
      }));

      return { ...bulkVariant, images: copiedImages };
    });

    // Combine all processed variants
    const allProcessedVariants = [...processedNonBulkVariants, ...processedBulkVariants];

    await VariantService.createManyVariants(product._id.toString(), allProcessedVariants);

    return { product, signedUrls };
  }

  static async updateProduct(productId: string, data: UpdateProductDTO) {
    const product = await ProductValidationService.validateProductExists(productId);

    if (data.title && data.title !== product.title) {
      await ProductValidationService.validateTitleUniqueness(product.storeId.toString(), data.title, productId);

      data.slug = ProductValidationService.generateSlug(data.title);
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(productId, data, { new: true, runValidators: true });

    return updatedProduct;
  }

  static async deleteProduct(productId: string) {
    // First delete all variants associated with this product
    await VariantService.deleteVariantsByProductId(productId);

    // Then delete the product itself
    const deletedProduct = await ProductModel.findByIdAndDelete(productId);
    this.ensureProductExists(deletedProduct);
  }

  static async bulkUpdateProducts(productIds: string[], updateData: UpdateProductDTO) {
    try {
      // Validate that all products exist and get their current data
      const existingProducts = await ProductModel.find({ _id: { $in: productIds } });

      if (existingProducts.length !== productIds.length) {
        const foundIds = existingProducts.map(p => p._id.toString());
        const missingIds = productIds.filter(id => !foundIds.includes(id));
        throw new AppError(`Products not found: ${missingIds.join(', ')}`, 404);
      }

      // Perform bulk update
      const result = await ProductModel.updateMany(
        { _id: { $in: productIds } },
        { $set: updateData },
        { runValidators: true }
      );

      return {
        successful: result.modifiedCount,
        failed: productIds.length - result.modifiedCount,
        total: productIds.length,
        errors: []
      };
    } catch (error) {
      throw new AppError(`Bulk update failed: ${error}`, 500);
    }
  }

  private static ensureProductExists(product: any): void {
    if (!product) {
      throw new AppError('Product not found', 404);
    }
  }
}
