import { ProductModel } from '../../models/product.model';
import { ProductFilterOptions } from '../../types/product.types';
import { StoreModel } from '../../models/store.model';
import { AppError } from '../../utils/appError';

export class ProductFilterService {
  static async getFilteredProducts(options: ProductFilterOptions = {}) {
    const { search, category, minPrice, maxPrice, page = 1, limit = 20, sort = '-createdAt' } = options;

    const filter: any = {
      status: 'published',
    };

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      ProductModel.find(filter).sort(sort).skip(skip).limit(limit),
      ProductModel.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      pages,
      limit,
    };
  }

  static async getProductsByStore(storeSlug: string) {
    const storeId = await this.getStoreIdBySlug(storeSlug);

    const products = await ProductModel.find({
      storeId: storeId,
      status: 'published',
    });

    return products;
  }

  static async getProductBySlug(storeSlug: string, slug: string) {
    const storeId = await this.getStoreIdBySlug(storeSlug);

    const products = await ProductModel.aggregate([
      {
        $match: {
          storeId: storeId,
          slug: slug,
        },
      },
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
      { $limit: 1 },
    ]);

    if (!products || products.length === 0) {
      return null;
    }

    return products[0];
  }

  private static async getStoreIdBySlug(storeSlug: string) {
    const store = await StoreModel.findOne({ slug: storeSlug }).select('_id').lean();

    if (!store) {
      throw new AppError('Store not found', 404);
    }

    return store._id;
  }
}
