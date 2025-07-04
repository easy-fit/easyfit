import { Request, Response } from 'express';
import { CartItemService } from '../services/cartItem.service';
import { catchAsync } from '../utils/catchAsync';
import { CreateCartItemDTO, UpdateCartItemDTO } from '../types/cartItem.types';

export class CartItemController {
  static getCartItems = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const cartItems = await CartItemService.getCartItemsByUser(userId);
    res.status(200).json({
      status: 'success',
      data: {
        cartItems,
      },
    });
  });

  static addCartItem = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const data: CreateCartItemDTO = req.body;
    const cartItem = await CartItemService.addCartItem(data, userId);
    res.status(201).json({
      status: 'success',
      data: {
        cartItem,
      },
    });
  });

  static removeCartItem = catchAsync(async (req: Request, res: Response) => {
    const cartItemId = req.params.id;
    await CartItemService.removeCartItem(cartItemId);
    res.status(204).json({ status: 'success' });
  });

  static updateCartItemQuantity = catchAsync(
    async (req: Request, res: Response) => {
      const itemId = req.params.id;
      const userId = req.user?._id;
      const data: UpdateCartItemDTO = req.body;
      const updatedItem = await CartItemService.updateCartItemQuantity(
        itemId,
        data,
        userId,
      );
      res.status(200).json({
        status: 'success',
        data: {
          updatedItem,
        },
      });
    },
  );

  static clearCart = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    await CartItemService.clearCart(userId);
    res.status(204).json({ status: 'success' });
  });
}
