import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { protect, restrictTo, isKYCVerified } from '../middlewares/auth';
import { uploadExcel, handleUploadError, extractStoreIdFromForm } from '../middlewares/upload.middleware';
import { verifyStoreAccessFromBody } from '../middlewares/resourceAccess.middleware';

export const uploadRoutes = Router();

// Bulk upload route - handled separately to avoid JSON parser conflicts
uploadRoutes.post('/products/bulk-upload',
  protect,
  restrictTo('admin', 'merchant', 'manager'),
  isKYCVerified,
  uploadExcel,
  handleUploadError,
  extractStoreIdFromForm,
  verifyStoreAccessFromBody,
  ProductController.bulkUploadProducts
);