import { ProductModel } from '../models/product.model';
import { AppError } from '../utils/appError';
import { CreateProductDTO, UpdateProductDTO } from '../types/product.types';

export class ProductService {
  static async getProducts() {
    return ProductModel.find();
  }

  static async getProductById(productId: string) {
    const product = await ProductModel.findById(productId);
    this.ensureProductExists(product);
    return product;
  }

  static async createProduct(data: CreateProductDTO) {
    return ProductModel.create(data);
  }

  static async updateProduct(productId: string, updates: UpdateProductDTO) {
    const product = await ProductModel.findByIdAndUpdate(productId, updates, {
      new: true,
    });
    this.ensureProductExists(product);

    return product;
  }

  static async deleteProduct(productId: string) {
    const product = await ProductModel.findByIdAndDelete(productId);
    this.ensureProductExists(product);
  }

  private static ensureProductExists(product: any): void {
    if (!product) {
      throw new AppError('Product not found', 404);
    }
  }
}
