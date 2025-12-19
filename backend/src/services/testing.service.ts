import { User } from '../types/user.types';
import { CartItemService } from './cartItem.service';
import { CheckoutShippingService } from './checkout/checkoutShipping.service';
import { OrderService } from './order.service';
import { AppError } from '../utils/appError';
import { ShippingType } from '../types/order.types';

export class TestingService {
  /**
   * Creates a test order bypassing MercadoPago payment processing
   * This is only available in staging/testing environments
   */
  static async createTestOrder(user: User, userAddress: any, shippingType: ShippingType = 'simple') {
    // Ensure we have a valid address
    if (!userAddress || !userAddress.location) {
      throw new AppError('User address is required for checkout', 400);
    }

    // Get cart items (same as normal checkout)
    const cartItems = await CartItemService.getCartItemsForCheckout(user._id);
    
    if (!cartItems || cartItems.length === 0) {
      throw new AppError('No cart items found for user', 400);
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce((total, item: any) => {
      return total + item.variantId.price * item.quantity;
    }, 0);

    // Calculate shipping (same as normal checkout)
    const shipping = await CheckoutShippingService.calculateShipping(userAddress, cartItems, shippingType);
    const storeId = shipping.storeId;
    delete shipping.storeId;

    const total = subtotal + shipping.cost;

    // Create cart items snapshot for order
    const cartItemsSnapshot = cartItems.map((item: any) => ({
      variantId: item.variantId._id.toString(),
      title: item.variantId.productId.title,
      quantity: item.quantity,
      unit_price: item.variantId.price,
    }));

    // Create order directly (bypassing payment processing)
    const order = await OrderService.createOrder(
      user._id,
      storeId,
      cartItemsSnapshot,
      total,
      shipping,
      'test_payment', // Test payment type
      `test_payment_${Date.now()}` // Mock external payment ID
    );

    // Don't clear cart in testing - keep items for repeated testing
    // await CartItemService.clearCart(user._id);

    return {
      order,
      storeId,
      total,
      subtotal,
      shipping
    };
  }

  /**
   * Simulate store response to an order
   * This allows testing the order flow without a real store interface
   */
  static async simulateStoreResponse(orderId: string, storeId: string, accepted: boolean, reason?: string) {
    return OrderService.handleStoreResponse(orderId, storeId, accepted, reason);
  }

  /**
   * Get order with complete data for testing
   */
  static async getTestOrderById(orderId: string) {
    return OrderService.getOrderById(orderId);
  }
}