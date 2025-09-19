import { Request, Response } from 'express';
import { ProductService } from '../services/product/product.service';
import { BulkUploadService } from '../services/product/bulkUpload.service';
import { catchAsync } from '../utils/catchAsync';
import { CreateProductDTO, UpdateProductDTO } from '../types/product.types';
import { CreateVariantDTO } from '../types/variant.types';

export class ProductController {
  static getProducts = catchAsync(async (req: Request, res: Response) => {
    const { search, category, minPrice, maxPrice, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const filterOptions = {
      search: search as string,
      category: category as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: Number(page),
      limit: Number(limit),
      sort: sort as string,
    };

    const result = await ProductService.getProducts(filterOptions);

    res.status(200).json({
      status: 'success',
      results: result.products.length,
      pagination: {
        total: result.total,
        page: result.page,
        pages: result.pages,
        limit: result.limit,
      },
      data: {
        products: result.products,
      },
    });
  });

  static getProductsByStore = catchAsync(async (req: Request, res: Response) => {
    const storeSlug = req.params.storeSlug;
    const products = await ProductService.getProductsByStore(storeSlug);
    res.status(200).json({ total: products.length, data: products });
  });

  static getProductById = catchAsync(async (req: Request, res: Response) => {
    const productId = req.params.id;
    const product = await ProductService.getProductById(productId);
    res.status(200).json({ data: product });
  });

  static getProductBySlug = catchAsync(async (req: Request, res: Response) => {
    const { storeSlug, slug } = req.params;
    const product = await ProductService.getProductBySlug(storeSlug, slug);
    res.status(200).json({ data: product });
  });

  static createProduct = catchAsync(async (req: Request, res: Response) => {
    const { product, variants, storeId } = req.body as {
      product: CreateProductDTO;
      variants: CreateVariantDTO[];
      storeId: string;
    };

    const result = await ProductService.createProduct(product, variants, storeId);
    res.status(201).json({ data: result });
  });

  static updateProduct = catchAsync(async (req: Request, res: Response) => {
    const data: UpdateProductDTO = req.body;
    const productId = req.params.id;
    const product = await ProductService.updateProduct(productId, data);
    res.status(200).json({ data: product });
  });

  static deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const productId = req.params.id;
    await ProductService.deleteProduct(productId);
    res.status(204).json({ status: 'success' });
  });

  static bulkUpdateProducts = catchAsync(async (req: Request, res: Response) => {
    const { productIds, updateData } = req.body as {
      productIds: string[];
      updateData: UpdateProductDTO;
    };

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'productIds array is required and cannot be empty'
      });
      return;
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'updateData is required and cannot be empty'
      });
      return;
    }

    const result = await ProductService.bulkUpdateProducts(productIds, updateData);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  static bulkUploadProducts = catchAsync(async (req: Request, res: Response) => {
    // Handle multer.any() structure
    const files = req.files as Express.Multer.File[];
    const excelFile = files?.find(file => file.fieldname === 'excelFile');

    if (!excelFile) {
      res.status(400).json({
        status: 'error',
        message: 'Excel file is required'
      });
      return;
    }

    // Get storeId from request body (populated by multer from form data)
    const storeId = req.body.storeId;
    if (!storeId) {
      res.status(400).json({
        status: 'error',
        message: 'Store ID is required'
      });
      return;
    }

    const result = await BulkUploadService.processExcelFile(excelFile.buffer, storeId);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });
}
