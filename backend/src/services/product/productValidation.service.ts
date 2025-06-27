import { ProductModel } from '../../models/product.model';
import { AppError } from '../../utils/appError';
import slugify from 'slugify';

export class ProductValidationService {
  static async checkTitleExists(storeId: string, title: string): Promise<boolean> {
    const existingProduct = await ProductModel.findOne(
      {
        storeId,
        title,
      },
      { title: 1, _id: 0 },
    ).lean();
    return !!existingProduct;
  }

  static async validateTitleUniqueness(
    storeId: string,
    title: string,
    excludeProductId?: string,
  ) {
    const query: any = { storeId, title };
    if (excludeProductId) {
      query._id = { $ne: excludeProductId };
    }

    const existingProduct = await ProductModel.findOne(query, { title: 1, _id: 0 }).lean();
    
    if (existingProduct) {
      throw new AppError('Product with this title already exists in the store', 400);
    }
  }

  static generateSlug(title: string): string {
    return slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  static async validateProductExists(productId: string) {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }
}