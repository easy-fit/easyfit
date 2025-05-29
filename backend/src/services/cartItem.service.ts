import { CartItemModel } from '../models/cartItem.model';
import { AppError } from '../utils/appError';
import { CreateCartItemDTO } from '../types/cartItem.types';
import { VariantService } from './variant.service';

export class CartItemService {
  static async getCartItemsByUser(userId: string) {
    return CartItemModel.find({ userId }).populate('variantId');
  }

  static async addCartItem(dto: CreateCartItemDTO) {
    await VariantService.checkStockAvailable(dto.variantId, dto.quantity);
    const existingItem = await CartItemModel.findOne({
      userId: dto.userId,
      variantId: dto.variantId,
    });
    if (existingItem) {
      existingItem.quantity += dto.quantity;
      return existingItem.save();
    }
    return CartItemModel.create(dto);
  }

  static async updateCartItemQuantity(
    userId: string,
    variantId: string,
    quantity: number,
  ) {
    const item = await CartItemModel.findOne({ userId, variantId });
    if (!item) {
      throw new AppError('Cart item not found for update', 404);
    }

    await VariantService.checkStockAvailable(variantId, quantity);
    item.quantity = quantity;
    return item.save();
  }

  static async removeCartItem(itemId: string) {
    const deleted = await CartItemModel.findByIdAndDelete(itemId);
    if (!deleted) {
      throw new AppError('Cart item not found', 404);
    }
  }

  static async clearCart(userId: string) {
    await CartItemModel.deleteMany({ userId });
  }
}
