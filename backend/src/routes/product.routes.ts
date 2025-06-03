import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { protect, restrictTo, isEmailVerified } from '../middlewares/auth';

export const productRoutes = Router();

productRoutes
  .route('/')
  .get(protect, restrictTo('admin'), ProductController.getProducts)
  .post(
    protect,
    restrictTo('admin', 'merchant'),
    isEmailVerified,
    ProductController.createProduct,
  );

productRoutes
  .route('/:id')
  .get(ProductController.getProductById)
  .patch(
    protect,
    restrictTo('admin', 'merchant'),
    isEmailVerified,
    ProductController.updateProduct,
  )
  .delete(
    protect,
    restrictTo('admin', 'merchant'),
    isEmailVerified,
    ProductController.deleteProduct,
  );
