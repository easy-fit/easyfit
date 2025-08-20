import { StoreModel } from '../../models/store.model';
import { StoreFilterOptions } from '../../types/store.types';
import { calculateDistance } from '../../utils/distance';
import { SHIPPING_CONFIG, SHIPPING_BASE_COSTS } from '../../config/shipping';

export class StoreFilterService {
  static async getFilteredStores(options: StoreFilterOptions = {}) {
    const {
      tags,
      status = 'active',
      isOpen,
      rating,
      page = 1,
      nearLocation,
      limit = 20,
      sort = '-createdAt',
    } = options;

    const filter: any = {
      status: status || 'active',
    };

    if (isOpen !== undefined) {
      filter.isOpen = isOpen;
    }

    if (rating !== undefined) {
      filter.averageRating = { $gte: rating };
    }

    if (tags) {
      const tagsList = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagsList };
    }

    const skip = (page - 1) * limit;

    if (nearLocation && nearLocation.longitude && nearLocation.latitude) {
      return this.getStoresNearLocation(nearLocation, filter, sort, skip, limit, page);
    } else {
      return this.getStoresWithoutLocation(filter, sort, skip, limit, page);
    }
  }

  private static async getStoresNearLocation(
    nearLocation: any,
    filter: any,
    sort: string,
    skip: number,
    limit: number,
    page: number,
  ) {
    const maxDistance = (nearLocation.maxDistance || 10) * 1000;

    const pipeline: any[] = [
      {
        $geoNear: {
          near: {
            type: 'Point' as const,
            coordinates: [nearLocation.longitude, nearLocation.latitude] as [number, number],
          },
          distanceField: 'distance',
          maxDistance: maxDistance,
          query: filter,
          spherical: true,
        },
      },
    ];

    if (sort !== 'distance') {
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      pipeline.push({ $sort: { [sortField]: sortOrder } });
    }

    const [stores, totalResult] = await Promise.all([
      StoreModel.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
      StoreModel.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = totalResult[0]?.total || 0;
    const pages = Math.ceil(total / limit);

    // Add shipping calculations when location is provided
    const storesWithShipping = stores.map((store) => {
      const distance = calculateDistance(
        { latitude: nearLocation.latitude, longitude: nearLocation.longitude },
        { latitude: store.address.location.coordinates[1], longitude: store.address.location.coordinates[0] },
      );

      const shippingCost =
        SHIPPING_CONFIG.pickupCost +
        SHIPPING_CONFIG.dropoffCost +
        distance * SHIPPING_CONFIG.costPerKm +
        SHIPPING_BASE_COSTS.simple;
      const deliveryTime = Math.round(distance * 10); // 2 minutes per km

      return {
        ...store,
        approximateDeliveryTime: deliveryTime,
        approximateShippingCost: Math.round(shippingCost),
      };
    });

    return {
      stores: storesWithShipping,
      pagination: {
        total,
        page,
        pages,
        limit,
      },
    };
  }

  private static async getStoresWithoutLocation(filter: any, sort: string, skip: number, limit: number, page: number) {
    const [stores, total] = await Promise.all([
      StoreModel.find(filter).sort(sort).skip(skip).limit(limit),
      StoreModel.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    // Add null values for shipping when no location provided
    const storesWithShipping = stores.map((store) => ({
      ...store.toObject(),
      approximateDeliveryTime: null,
      approximateShippingCost: null,
    }));

    return {
      stores: storesWithShipping,
      pagination: {
        total,
        page,
        pages,
        limit,
      },
    };
  }
}
