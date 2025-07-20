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
    const product = await ProductModel.findById(productId);
    this.ensureProductExists(product);
    return product;
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

    // Process variant images
    const images = variants.flatMap((variant) =>
      variant.images.map((img) => ({
        key: img.key,
        contentType: img.contentType || 'image/jpeg',
      })),
    );

    const signedUrls = await R2Service.getSignedUrls({
      bucket: R2.BUCKET_PRODUCTS,
      typePrefix: 'products',
      files: images,
    });

    let currentSignedUrlIndex = 0;
    const updatedVariants = variants.map((variant) => {
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

    await VariantService.createManyVariants(product._id.toString(), updatedVariants);

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
    const variants = await VariantService.getVariantsByProductId(productId);
    if (variants) {
      throw new AppError('Cannot delete product with existing variants', 400);
    }

    const deletedProduct = await ProductModel.findByIdAndDelete(productId);
    this.ensureProductExists(deletedProduct);
  }

  private static ensureProductExists(product: any): void {
    if (!product) {
      throw new AppError('Product not found', 404);
    }
  }
}
