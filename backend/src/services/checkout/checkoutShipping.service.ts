import { calculateCityDistance } from '../../utils/distance';
import { SHIPPING_CONFIG } from '../../config/shipping';
import { StoreService } from '../store/store.service';

export class CheckoutShippingService {
  static async calculateShipping(userAddress: any, cartItems: any[]) {
    try {
      const storeId = cartItems[0]?.variantId?.productId?.storeId;

      const storeLocation = await StoreService.getStoreLocationById(storeId);

      if (!storeLocation || !userAddress.location) {
        return {
          cost: SHIPPING_CONFIG.pickupCost + SHIPPING_CONFIG.dropoffCost,
          type: 'simple',
          tryOnEnabled: false,
          distanceKm: 0,
        };
      }

      const distanceResult = await calculateCityDistance(
        {
          latitude: storeLocation[1],
          longitude: storeLocation[0],
        },
        {
          latitude: userAddress.location.coordinates[1],
          longitude: userAddress.location.coordinates[0],
        },
      );

      const shippingCost =
        SHIPPING_CONFIG.pickupCost +
        SHIPPING_CONFIG.dropoffCost +
        distanceResult.distance * SHIPPING_CONFIG.costPerKm;

      return {
        cost: Math.round(shippingCost),
        type: 'simple',
        tryOnEnabled: false,
        distanceKm: distanceResult.distance,
        durationMinutes: distanceResult.duration,
      };
    } catch (error) {
      return {
        cost: SHIPPING_CONFIG.pickupCost + SHIPPING_CONFIG.dropoffCost,
        type: 'simple',
        tryOnEnabled: false,
        distanceKm: 0,
      };
    }
  }
}