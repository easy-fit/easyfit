import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

export const productRoutes = Router();

productRoutes
  .route('/')
  .get(ProductController.getProducts)
  .post(ProductController.createProduct);

productRoutes
  .route('/:id')
  .get(ProductController.getProductById)
  .patch(ProductController.updateProduct)
  .delete(ProductController.deleteProduct);
