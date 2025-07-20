import { calculateCityDistance } from '../../utils/distance';
import { SHIPPING_CONFIG, SHIPPING_BASE_COSTS } from '../../config/shipping';
import { StoreService } from '../store/store.service';
import { ShippingType } from '../../types/order.types';

export class CheckoutShippingService {
  static async calculateShipping(userAddress: any, cartItems: any[], shippingType: ShippingType) {
    try {
      const storeId = cartItems[0]?.variantId?.productId?.storeId;

      const storeLocation = await StoreService.getStoreLocationById(storeId);

      // doesnt have importance this condition, just to avoid typescript error
      if (!storeLocation || !userAddress.location) {
        return {
          cost: SHIPPING_CONFIG.pickupCost + SHIPPING_CONFIG.dropoffCost,
          type: shippingType,
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

      const shippingTypeCost = SHIPPING_BASE_COSTS[shippingType];
      const shippingCost =
        SHIPPING_CONFIG.pickupCost +
        SHIPPING_CONFIG.dropoffCost +
        distanceResult.distance * SHIPPING_CONFIG.costPerKm +
        shippingTypeCost;

      return {
        cost: Math.round(shippingCost),
        type: shippingType,
        tryOnEnabled: shippingType === 'premium' || shippingType === 'advanced',
        distanceKm: distanceResult.distance,
        durationMinutes: distanceResult.duration,
        address: {
          formatted: userAddress.formatted,
          coordinates: userAddress.location.coordinates,
        },
        storeId, // just to include on checkoutsession
      };
    } catch (error) {
      return {
        cost: SHIPPING_CONFIG.pickupCost + SHIPPING_CONFIG.dropoffCost,
        type: shippingType,
        tryOnEnabled: false,
        distanceKm: 0,
      };
    }
  }
}
