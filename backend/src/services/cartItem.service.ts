import { CartItemModel } from '../models/cartItem.model';
import { VariantModel } from '../models/variant.model';
import { AppError } from '../utils/appError';
import { CreateCartItemDTO, UpdateCartItemDTO } from '../types/cartItem.types';
import { VariantService } from './variant/variant.service';

export class CartItemService {
  static async getCartItemsByUser(userId: string) {
    const items = await CartItemModel.find({ userId }).populate({
      path: 'variantId',
      select: 'size color price discount images productId',
      populate: {
        path: 'productId',
        select: 'title allowedShippingTypes',
      },
    });

    // 1. Filtrar ítems válidos (donde la variante y el producto aún existen en la DB)
    const validItems = items.filter((item) => item.variantId && (item.variantId as any).productId);

    // 2. Si encontramos ítems corruptos/fantasmas, los borramos de la DB
    if (validItems.length !== items.length) {
      const invalidIds = items
        .filter((item) => !item.variantId || !(item.variantId as any).productId)
        .map((item) => item._id);
      
      if (invalidIds.length > 0) {
        // Borrado asíncrono para limpiar la basura de la base de datos
        CartItemModel.deleteMany({ _id: { $in: invalidIds } }).catch(console.error);
      }
    }

    return validItems;
  }

  static async addCartItem(data: CreateCartItemDTO, userId: string) {
    await this.checkTotalCartItems(userId, data.quantity);
    await this.checkMixedStores(userId, data.variantId);
    await VariantService.checkStockAvailable(data.variantId, data.quantity);

    const existingItem = await CartItemModel.findOne({
      userId,
      variantId: data.variantId,
    });
    if (existingItem) {
      existingItem.quantity += data.quantity;
      return existingItem.save();
    }

    const enhancedDto = { ...data, userId };
    return CartItemModel.create(enhancedDto);
  }

  static async updateCartItemQuantity(itemId: string, data: UpdateCartItemDTO, userId: string) {
    if (data.quantity < 1 || data.quantity > 6) {
      throw new AppError('Quantity must be between 1 and 6', 400);
    }
    const item = await CartItemModel.findById(itemId);
    if (!item) {
      throw new AppError('Cart item not found for update', 404);
    }

    await this.checkTotalCartItems(userId, data.quantity - item.quantity);

    await VariantService.checkStockAvailable(item.variantId.toString(), data.quantity);
    item.quantity = data.quantity;
    return item.save();
  }

  static async removeCartItem(cartItemId: string) {
    const deleted = await CartItemModel.findByIdAndDelete(cartItemId);
    if (!deleted) {
      throw new AppError('Cart item not found', 404);
    }
  }

  static async clearCart(userId: string) {
    await CartItemModel.deleteMany({ userId });
  }

  static async getCartItemsForCheckout(userId: string) {
    const items = await CartItemModel.find({ userId }).populate({
      path: 'variantId',
      select: 'size color price discount productId',
      populate: {
        path: 'productId',
        select: 'storeId title allowedShippingTypes',
      },
    });

    const validItems = items.filter((item) => item.variantId && (item.variantId as any).productId);

    if (!validItems || validItems.length === 0) {
      throw new AppError('Cart is empty or contains only invalid items', 400);
    }
    return validItems;
  }

  private static async checkTotalCartItems(userId: string, itemQuantity: number = 0) {
    const items = await CartItemModel.find({ userId }).select('quantity');
    const totalItems = items.reduce((total, item) => total + item.quantity, itemQuantity);
    if (totalItems > 6) {
      throw new AppError('Cart can only hold up to 6 items', 400);
    }
  }

  private static async checkMixedStores(userId: string, variantId: string) {
    const cartItems = await CartItemModel.find({ userId })
      .populate({
        path: 'variantId',
        select: 'productId',
        populate: {
          path: 'productId',
          select: 'storeId',
        },
      })
      .lean();

    const validCartItems = cartItems.filter(item => item.variantId && (item.variantId as any).productId);

    if (validCartItems.length === 0) return;

    const newVariant = await VariantModel.findById(variantId)
      .populate({
        path: 'productId',
        select: 'storeId',
      })
      .lean();

    if (!newVariant || !newVariant.productId) {
      throw new AppError('Invalid variant', 400);
    }

    const newStoreId = (newVariant.productId as any).storeId.toString();
    const existingStoreId = (validCartItems[0].variantId as any).productId.storeId.toString();

    if (newStoreId !== existingStoreId) {
      throw new AppError('Cannot mix products from different stores in cart', 400);
    }
  }
}