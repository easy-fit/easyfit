import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { VariantController } from '../controllers/variant.controller';
import { protect, restrictTo, isKYCVerified } from '../middlewares/auth';
import {
  verifyProductOwnership,
  verifyVariantOwnership,
  verifyStoreOwnershipFromBody,
} from '../middlewares/resourceAccess.middleware';

export const productRoutes = Router();

// ==== RUTAS PÚBLICAS ====

productRoutes.route('/').get(ProductController.getProducts);

productRoutes.route('/:storeSlug/products').get(ProductController.getProductsByStore);

productRoutes.route('/:storeSlug/product/:slug').get(ProductController.getProductBySlug);

productRoutes.route('/:id').get(ProductController.getProductById);

// ==== RUTAS PROTEGIDAS PARA PRODUCTOS ====

productRoutes
  .route('/')
  .post(
    protect,
    restrictTo('admin', 'merchant'),
    isKYCVerified,
    verifyStoreOwnershipFromBody,
    ProductController.createProduct,
  );

productRoutes
  .route('/:id')
  .patch(
    protect,
    restrictTo('admin', 'merchant'),
    isKYCVerified,
    verifyProductOwnership,
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
productRoutes.use(
  '/:id/variants',
  protect,
  restrictTo('admin', 'merchant'),
  isKYCVerified,
  verifyProductOwnership,
  variantRouter,
);

variantRouter.route('/').get(VariantController.getVariants).post(VariantController.createVariant);

variantRouter
  .route('/:id')
  .get(VariantController.getVariantById)
  .patch(verifyVariantOwnership, VariantController.updateVariant)
  .delete(verifyVariantOwnership, VariantController.deleteVariant);

variantRouter
  .route('/:id/images')
  .delete(verifyVariantOwnership, VariantController.deleteVariantImage)
  .post(verifyVariantOwnership, VariantController.addVariantImage);
