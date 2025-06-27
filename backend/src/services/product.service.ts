import slugify from 'slugify';
import { ProductModel } from '../models/product.model';
import { AppError } from '../utils/appError';
import { StoreService } from './store.service';
import {
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilterOptions,
} from '../types/product.types';
import { CreateVariantDTO } from '../types/variant.types';
import { VariantService } from './variant.service';
import { R2Service } from './r2.service';
import { R2 } from '../config/env';

export class ProductService {
  static async getProducts(options: ProductFilterOptions = {}) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = options;

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

  static async getProductById(productId: string) {
    const product = await ProductModel.findById(productId);
    this.ensureProductExists(product);
    return product;
  }

  static async getProductsByStore(storeSlug: string) {
    const storeId = await StoreService.getStoreIdBySlug(storeSlug);

    const products = await ProductModel.find({
      storeId: storeId,
      status: 'published',
    });

    if (!products || products.length === 0) {
      throw new AppError('No products found for this store', 404);
    }

    return products;
  }

  static async getProductBySlug(storeSlug: string, slug: string) {
    const storeId = await StoreService.getStoreIdBySlug(storeSlug);

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
      throw new AppError('Product not found', 404);
    }
    const product = products[0];

    return product;
  }

  static async createProduct(
    data: CreateProductDTO,
    variants: CreateVariantDTO[],
    storeId: string,
  ) {
    const existingProduct = await this.checkTitleExists(storeId, data.title);
    if (existingProduct) {
      throw new AppError(
        'Product with this title already exists in the store',
        400,
      );
    }

    const slug = slugify(data.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const enhancedData = { ...data, storeId, slug };
    const product = await ProductModel.create(enhancedData);

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
    await VariantService.createManyVariants(
      product._id.toString(),
      updatedVariants,
    );
    return { product, signedUrls };
  }

  static async updateProduct(productId: string, data: UpdateProductDTO) {
    const product = await ProductModel.findById(productId);
    this.ensureProductExists(product);

    if (data.title && data.title !== product?.title) {
      const titleExists = await this.checkTitleExists(
        product?.storeId.toString() || '',
        data.title,
      );

      if (titleExists) {
        throw new AppError(
          'Product with this title already exists in the store',
          400,
        );
      }

      data.slug = slugify(data.title, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      data,
      { new: true, runValidators: true },
    );

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

  private static async checkTitleExists(
    storeId: string,
    title: string,
  ): Promise<boolean> {
    const existingProduct = await ProductModel.findOne(
      {
        storeId,
        title,
      },
      { title: 1, _id: 0 },
    ).lean();
    return !!existingProduct;
  }
}
