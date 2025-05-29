import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { catchAsync } from '../utils/catchAsync';
import { CreateProductDTO, UpdateProductDTO } from '../types/product.types';

export class ProductController {
  static getProducts = catchAsync(async (_req: Request, res: Response) => {
    const products = await ProductService.getProducts();
    res.status(200).json({ total: products.length, products });
  });

  static getProductById = catchAsync(async (req: Request, res: Response) => {
    const product = await ProductService.getProductById(req.params.id);
    res.status(200).json({ product });
  });

  static createProduct = catchAsync(async (req: Request, res: Response) => {
    const dto: CreateProductDTO = req.body;
    const product = await ProductService.createProduct(dto);
    res.status(201).json({ product });
  });

  static updateProduct = catchAsync(async (req: Request, res: Response) => {
    const dto: UpdateProductDTO = req.body;
    const product = await ProductService.updateProduct(req.params.id, dto);
    res.status(200).json({ product });
  });

  static deleteProduct = catchAsync(async (req: Request, res: Response) => {
    await ProductService.deleteProduct(req.params.id);
    res.status(204).json({ status: 'success' });
  });
}
