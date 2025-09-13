import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { VariantController } from '../controllers/variant.controller';
import { protect, restrictTo, isKYCVerified } from '../middlewares/auth';
import {
  verifyProductOwnership,
  verifyProductAccess,
  verifyVariantOwnership,
  verifyVariantAccess,
  verifyStoreOwnershipFromBody,
  verifyStoreAccessFromBody,
  verifyStoreAccess,
} from '../middlewares/resourceAccess.middleware';

export const productRoutes = Router();

// ==== RUTAS PÚBLICAS ====

productRoutes.route('/').get(ProductController.getProducts);

productRoutes.route('/id/:id').get(ProductController.getProductById);

// Bulk operations - placed before dynamic routes to avoid conflicts
productRoutes
  .route('/variants/bulk')
  .get(
    protect, 
    restrictTo('admin', 'merchant', 'manager'), 
    isKYCVerified,
    VariantController.getBulkVariants
  )
  .patch(
    protect, 
    restrictTo('admin', 'merchant', 'manager'), 
    isKYCVerified,
    VariantController.bulkUpdateVariants
  );

productRoutes
  .route('/variants/by-products')
  .get(
    protect, 
    restrictTo('admin', 'merchant', 'manager'), 
    isKYCVerified,
    VariantController.getVariantsByProducts
  );

productRoutes.route('/:storeSlug/products').get(ProductController.getProductsByStore);
productRoutes.route('/:storeSlug/:slug').get(ProductController.getProductBySlug);

// ==== RUTAS PROTEGIDAS PARA PRODUCTOS ====

productRoutes
  .route('/')
  .post(
    protect,
    restrictTo('admin', 'merchant', 'manager'),
    isKYCVerified,
    verifyStoreAccessFromBody,
    ProductController.createProduct,
  );

productRoutes
  .route('/id/:id')
  .patch(
    protect,
    restrictTo('admin', 'merchant', 'manager'),
    isKYCVerified,
    verifyProductAccess,
    ProductController.updateProduct,
  )
  .delete(
    protect,
    restrictTo('admin', 'merchant'),
    isKYCVerified,
    verifyProductOwnership,
    ProductController.deleteProduct,
  );

const variantRouter = Router({ mergeParams: true });
productRoutes.use('/:id/variants', protect, restrictTo('admin', 'merchant', 'manager'), isKYCVerified, variantRouter);

variantRouter.route('/').get(VariantController.getVariants).post(VariantController.createVariant);

variantRouter
  .route('/:id')
  .get(VariantController.getVariantById)
  .patch(verifyVariantAccess, VariantController.updateVariant)
  .delete(verifyVariantAccess, VariantController.deleteVariant);

variantRouter
  .route('/:id/images')
  .delete(verifyVariantAccess, VariantController.deleteVariantImage)
  .post(verifyVariantAccess, VariantController.addVariantImage);
