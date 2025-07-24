import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError';
import { ProductModel } from '../models/product.model';
import { StoreModel } from '../models/store.model';
import { VariantModel } from '../models/variant.model';
import { CheckoutSessionModel } from '../models/checkout.model';
import { OrderModel } from '../models/order.model';
import { RiderAssignmentModel } from '../models/riderAssignment.model';

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

      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        return next(new AppError(`Invalid ${config.resourceIdParam} format`, 400));
      }

      let query = config.resourceModel.findById(resourceId);

      if (config.populatePath) {
        query = query.populate(config.populatePath);
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

// Store ownership verification
export const verifyStoreOwnership = createOwnershipVerifier({
  resourceModel: StoreModel,
  resourceIdParam: 'id',
  ownerPath: 'merchantId',
});

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
  populatePath: 'productId.storeId',
});

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

// Verify store ownership when creating products (storeId in body)
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
