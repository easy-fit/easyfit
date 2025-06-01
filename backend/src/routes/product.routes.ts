import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth';

export const productRoutes = Router();

productRoutes
  .route('/')
  .get(protect, restrictTo('admin'), ProductController.getProducts)
  .post(
    protect,
    restrictTo('admin', 'merchant'),
    ProductController.createProduct,
  );

productRoutes
  .route('/:id')
  .get(ProductController.getProductById)
  .patch(
    protect,
    restrictTo('admin', 'merchant'),
    ProductController.updateProduct,
  )
  .delete(
    protect,
    restrictTo('admin', 'merchant'),
    ProductController.deleteProduct,
  );
