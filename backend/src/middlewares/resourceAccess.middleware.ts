import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError';
import { ProductModel } from '../models/product.model';
import { StoreModel } from '../models/store.model';
import { VariantModel } from '../models/variant.model';
import { CheckoutSessionModel } from '../models/checkout.model';
import { OrderModel } from '../models/order.model';
import { RiderAssignmentModel } from '../models/riderAssignment.model';
import { StoreManagerModel } from '../models/storeManager.model';

// Helper function to check if user has access to a store (as owner or manager)
const hasStoreAccess = async (userId: string, storeId: string): Promise<boolean> => {
  // First check if user owns the store
  const store = await StoreModel.findById(storeId);
  if (store && store.merchantId.toString() === userId.toString()) {
    return true;
  }

  // Then check if user is assigned as manager
  const managerAssignment = await StoreManagerModel.findOne({
    storeId,
    managerId: userId,
    isActive: true,
  });

  return !!managerAssignment;
};

interface OwnershipConfig {
  resourceModel: mongoose.Model<any>;
  resourceIdParam: string;
  ownerPath: string;
  populatePath?: string;
}

export const createOwnershipVerifier = (config: OwnershipConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Admin bypass
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[config.resourceIdParam];
      const userId = req.user._id;

      if (!resourceId) {
        return next(new AppError(`${config.resourceIdParam} parameter is required`, 400));
      }

      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        return next(new AppError(`Invalid ${config.resourceIdParam} format`, 400));
      }

      let query = config.resourceModel.findById(resourceId);

      if (config.populatePath) {
        // Handle nested population for variants
        if (config.populatePath === 'productId' && config.ownerPath === 'productId.storeId.merchantId') {
          query = query.populate({
            path: 'productId',
            populate: {
              path: 'storeId',
            },
          });
        } else {
          query = query.populate(config.populatePath);
        }
      }

      const resource = await query;

      if (!resource) {
        return next(new AppError(`Resource not found`, 404));
      }

      // Navigate through the ownership path
      const ownerParts = config.ownerPath.split('.');
      let owner = resource;

      for (const part of ownerParts) {
        if (!owner || typeof owner !== 'object') {
          return next(new AppError('Resource ownership structure is invalid', 500));
        }
        owner = owner[part];
      }

      if (!owner) {
        return next(new AppError('Resource owner information is missing', 500));
      }

      const ownerId = owner._id ? owner._id.toString() : owner.toString();

      if (ownerId !== userId.toString()) {
        return next(new AppError('You do not have permission to access this resource', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Store ownership verification (strict - only store owners)
export const verifyStoreOwnership = createOwnershipVerifier({
  resourceModel: StoreModel,
  resourceIdParam: 'id',
  ownerPath: 'merchantId',
});

// Store access verification (includes both owners and managers)
export const verifyStoreAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin bypass
    if (req.user.role === 'admin') {
      return next();
    }

    const storeId = req.params.id;
    const userId = req.user._id.toString();

    if (!storeId) {
      return next(new AppError('Store ID parameter is required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return next(new AppError('Invalid store ID format', 400));
    }

    const hasAccess = await hasStoreAccess(userId, storeId);

    if (!hasAccess) {
      return next(new AppError('You do not have permission to access this store', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Product ownership verification (through store)
export const verifyProductOwnership = createOwnershipVerifier({
  resourceModel: ProductModel,
  resourceIdParam: 'id',
  ownerPath: 'storeId.merchantId',
  populatePath: 'storeId',
});

// Variant ownership verification (through product->store)
export const verifyVariantOwnership = createOwnershipVerifier({
  resourceModel: VariantModel,
  resourceIdParam: 'id',
  ownerPath: 'productId.storeId.merchantId',
  populatePath: 'productId',
});

// Product access verification (includes both owners and managers)
export const verifyProductAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin bypass
    if (req.user.role === 'admin') {
      return next();
    }

    const productId = req.params.id;
    const userId = req.user._id.toString();

    if (!productId) {
      return next(new AppError('Product ID parameter is required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new AppError('Invalid product ID format', 400));
    }

    // Get product with populated store
    const product = await ProductModel.findById(productId).populate('storeId');
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const storeId = product.storeId._id.toString();
    const hasAccess = await hasStoreAccess(userId, storeId);

    if (!hasAccess) {
      return next(new AppError('You do not have permission to access this product', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Variant access verification (includes both owners and managers)
export const verifyVariantAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin bypass
    if (req.user.role === 'admin') {
      return next();
    }

    const variantId = req.params.id;
    const userId = req.user._id.toString();

    if (!variantId) {
      return next(new AppError('Variant ID parameter is required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      return next(new AppError('Invalid variant ID format', 400));
    }

    // Get variant with populated product and store
    const variant = await VariantModel.findById(variantId).populate({
      path: 'productId',
      populate: {
        path: 'storeId',
      },
    });

    if (!variant) {
      return next(new AppError('Variant not found', 404));
    }

    const storeId = (variant.productId as any).storeId._id.toString();
    const hasAccess = await hasStoreAccess(userId, storeId);

    if (!hasAccess) {
      return next(new AppError('You do not have permission to access this variant', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Order ownership verification (customers can only access their own orders)
export const verifyOrderOwnership = createOwnershipVerifier({
  resourceModel: OrderModel,
  resourceIdParam: 'id',
  ownerPath: 'userId',
});

export const verifyCheckoutOwnership = createOwnershipVerifier({
  resourceModel: CheckoutSessionModel,
  resourceIdParam: 'id',
  ownerPath: 'userId',
});

// Rider order ownership verification (through rider assignment)
export const verifyRiderOrderOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin bypass
    if (req.user.role === 'admin') {
      return next();
    }

    const orderId = req.params.id;
    const riderId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new AppError('Invalid order ID format', 400));
    }

    const assignment = await RiderAssignmentModel.findOne({
      orderId,
      riderId,
    });

    if (!assignment) {
      return next(new AppError('You are not assigned to this order', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Verify store ownership when creating products (storeId in body) - strict owners only
export const verifyStoreOwnershipFromBody = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin bypass
    if (req.user.role === 'admin') {
      return next();
    }

    const { storeId } = req.body;
    const userId = req.user._id;

    if (!storeId) {
      return next(new AppError('Store ID is required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return next(new AppError('Invalid store ID format', 400));
    }

    const store = await StoreModel.findById(storeId);

    if (!store) {
      return next(new AppError('Store not found', 404));
    }

    if (store.merchantId.toString() !== userId.toString()) {
      return next(new AppError('You do not have permission to create products in this store', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Verify store access when creating resources (includes both owners and managers)
export const verifyStoreAccessFromBody = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin bypass
    if (req.user.role === 'admin') {
      return next();
    }

    const { storeId } = req.body;
    const userId = req.user._id.toString();

    if (!storeId) {
      return next(new AppError('Store ID is required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return next(new AppError('Invalid store ID format', 400));
    }

    const hasAccess = await hasStoreAccess(userId, storeId);

    if (!hasAccess) {
      return next(new AppError('You do not have permission to access this store', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Store ownership verification for routes with :storeId parameter (strict - only store owners)
export const verifyStoreOwnershipByStoreId = createOwnershipVerifier({
  resourceModel: StoreModel,
  resourceIdParam: 'storeId',
  ownerPath: 'merchantId',
});

// Store access verification for routes with :storeId parameter (includes both owners and managers)
export const verifyStoreAccessByStoreId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin bypass
    if (req.user.role === 'admin') {
      return next();
    }

    const storeId = req.params.storeId;
    const userId = req.user._id.toString();

    if (!storeId) {
      return next(new AppError('Store ID parameter is required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return next(new AppError('Invalid store ID format', 400));
    }

    const hasAccess = await hasStoreAccess(userId, storeId);

    if (!hasAccess) {
      return next(new AppError('You do not have permission to access this store', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};
