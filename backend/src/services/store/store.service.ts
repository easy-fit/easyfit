import { StoreModel } from '../../models/store.model';
import { CreateStoreDTO, UpdateStoreDTO, StoreFilterOptions } from '../../types/store.types';
import { AppError } from '../../utils/appError';
import { STORE_TAGS_VALUES } from '../../types/store.constants';
import { StoreAssetService } from './storeAsset.service';
import { StoreFilterService } from './storeFilter.service';
import { isDeliveryLocationValid } from '../../utils/distance';
import slugify from 'slugify';

export class StoreService {
  static async getStores(options: StoreFilterOptions = {}) {
    return StoreFilterService.getFilteredStores(options);
  }

  static async getStoreById(storeId: string) {
    const store = await StoreModel.findById(storeId);
    this.ensureStoreExists(store);
    return store;
  }

  static async getStoreLocationById(storeId: string) {
    const store = await StoreModel.findById(storeId).select('address').lean();

    this.ensureStoreExists(store);
    return store?.address.location.coordinates;
  }

  static async getStoreBySlug(storeSlug: string) {
    const store = await StoreModel.findOne({ slug: storeSlug });
    this.ensureStoreExists(store);
    return store;
  }

  static async getStoreIdBySlug(storeSlug: string) {
    const store = await StoreModel.findOne({ slug: storeSlug }).select('_id').lean();

    this.ensureStoreExists(store);
    return store?._id;
  }

  static async createStore(data: CreateStoreDTO, userId: string) {
    const existingStore = await StoreModel.findOne({ name: data.name });
    if (existingStore) {
      throw new AppError('Store with this name already exists', 400);
    }

    if (data.address) {
      const storeCoordinates = {
        latitude: data.address.location.coordinates[0],
        longitude: data.address.location.coordinates[1],
      };

      const isValidDeliveryLocation = isDeliveryLocationValid(storeCoordinates);
      if (!isValidDeliveryLocation) {
        throw new AppError('Invalid delivery address', 400);
      }
    }

    this.checkStoreTags(data.tags);

    const slug = slugify(data.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const enhancedData = { ...data, merchantId: userId, slug };
    return StoreModel.create(enhancedData);
  }

  static async updateStore(storeId: string, data: UpdateStoreDTO) {
    if (data.tags) {
      this.checkStoreTags(data.tags);
    }

    if (data.address) {
      const storeCoordinates = {
        latitude: data.address.location.coordinates[1],
        longitude: data.address.location.coordinates[0],
      };

      const isValidDeliveryLocation = isDeliveryLocationValid(storeCoordinates);
      if (!isValidDeliveryLocation) {
        throw new AppError('Invalid delivery address', 400);
      }
    }

    const store = await StoreModel.findByIdAndUpdate(storeId, data, {
      new: true,
      runValidators: true,
    });

    this.ensureStoreExists(store);
    return store;
  }

  static async deleteStore(storeId: string) {
    const hasProducts = await this.hasProducts(storeId);
    if (hasProducts) {
      throw new AppError('Store cannot be deleted as it contains products. Please delete the products first.', 400);
    }
    await StoreModel.findByIdAndDelete(storeId);
  }

  // Asset management methods - delegated to StoreAssetService
  static async uploadStoreAsset(
    storeId: string,
    assetType: 'logo' | 'banner',
    fileData: { key: string; contentType: string },
  ) {
    return StoreAssetService.uploadAsset(storeId, assetType, fileData);
  }

  static async deleteStoreAsset(storeId: string, assetType: 'logo' | 'banner') {
    return StoreAssetService.deleteAsset(storeId, assetType);
  }

  private static ensureStoreExists(store: any): void {
    if (!store) {
      throw new AppError('Store not found', 404);
    }
  }

  private static async hasProducts(storeId: string): Promise<boolean> {
    const count = await StoreModel.countDocuments({ _id: storeId }).limit(1);
    return count > 0;
  }

  private static checkStoreTags(tags: string[]) {
    if (tags && tags.length > 0) {
      const invalidTags = tags.filter((tag) => !STORE_TAGS_VALUES.includes(tag as any));
      if (invalidTags.length > 0) {
        throw new AppError(`Invalid tags: ${invalidTags.join(', ')}`, 400);
      }
    }
  }
}
