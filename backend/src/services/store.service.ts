import { StoreModel } from '../models/store.model';
import {
  CreateStoreDTO,
  UpdateStoreDTO,
  StoreFilterOptions,
} from '../types/store.types';
import { AppError } from '../utils/appError';
import { STORE_TAGS_VALUES } from '../types/store.constants';
import { R2Service } from './r2.service';
import { FileItem } from '../types/storage.types';
import { R2 } from '../config/env';
import slugify from 'slugify';

export class StoreService {
  static async getStores(options: StoreFilterOptions = {}) {
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
      const maxDistance = (nearLocation.maxDistance || 10) * 1000;

      const pipeline: any[] = [
        {
          $geoNear: {
            near: {
              type: 'Point' as const,
              coordinates: [nearLocation.longitude, nearLocation.latitude] as [
                number,
                number,
              ],
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

      return {
        stores,
        pagination: {
          total,
          page,
          pages,
          limit,
        },
      };
    } else {
      const [stores, total] = await Promise.all([
        StoreModel.find(filter).sort(sort).skip(skip).limit(limit),
        StoreModel.countDocuments(filter),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        stores,
        pagination: {
          total,
          page,
          pages,
          limit,
        },
      };
    }
  }

  static async getStoreById(storeId: string) {
    const store = await StoreModel.findById(storeId);
    this.ensureStoreExists(store);
    return store;
  }

  static async getStoreBySlug(storeSlug: string) {
    const store = await StoreModel.findOne({ slug: storeSlug });
    this.ensureStoreExists(store);
    return store;
  }

  static async getStoreIdBySlug(storeSlug: string) {
    const store = await StoreModel.findOne({ slug: storeSlug })
      .select('_id')
      .lean();

    this.ensureStoreExists(store);

    return store?._id;
  }

  static async createStore(data: CreateStoreDTO, userId: string) {
    const existingStore = await StoreModel.findOne({ name: data.name });
    if (existingStore) {
      throw new AppError('Store with this name already exists', 400);
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
      throw new AppError(
        'Store cannot be deleted as it contains products. Please delete the products first.',
        400,
      );
    }
    await StoreModel.findByIdAndDelete(storeId);
  }

  static async uploadStoreAsset(
    storeId: string,
    assetType: 'logo' | 'banner',
    fileData: { key: string; contentType: string },
  ) {
    const store = await StoreModel.findById(storeId);
    this.ensureStoreExists(store);

    const fileItem: FileItem = {
      key: fileData.key,
      contentType: fileData.contentType,
    };

    const signedUrls = await R2Service.getSignedUrls({
      bucket: R2.BUCKET_ASSETS,
      typePrefix: 'assets',
      files: [fileItem],
    });

    if (!signedUrls || signedUrls.length === 0) {
      throw new AppError('Failed to generate upload URL', 500);
    }

    const signedUrl = signedUrls[0];

    // Delete old asset if it exists
    const oldAssetKey =
      assetType === 'logo'
        ? store?.customization?.logoUrl
        : store?.customization?.bannerUrl;

    if (oldAssetKey) {
      R2Service.deleteObject(R2.BUCKET_ASSETS, oldAssetKey).catch((err) =>
        console.error(`Error deleting old ${assetType}:`, err),
      );
    }

    // Update store with new asset URL
    const updateData = {
      [`customization.${assetType}Url`]: signedUrl.key_img,
    };

    const updatedStore = await StoreModel.findByIdAndUpdate(
      storeId,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    return {
      store: updatedStore,
      uploadInfo: {
        key: signedUrl.key_img,
        url: signedUrl.url,
      },
    };
  }

  static async deleteStoreAsset(storeId: string, assetType: 'logo' | 'banner') {
    const store = await StoreModel.findById(storeId);
    this.ensureStoreExists(store);

    const assetKey =
      assetType === 'logo'
        ? store?.customization?.logoUrl
        : store?.customization?.bannerUrl;

    if (!assetKey) {
      throw new AppError(`No ${assetType} found for this store`, 404);
    }

    // Remove asset URL from store
    const updateData = {
      [`customization.${assetType}Url`]: null,
    };

    const updatedStore = await StoreModel.findByIdAndUpdate(
      storeId,
      { $unset: updateData },
      { new: true },
    );

    // Delete from R2
    R2Service.deleteObject(R2.BUCKET_ASSETS, assetKey).catch((err) =>
      console.error(`Error deleting ${assetType} from R2:`, err),
    );

    return updatedStore;
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
      const invalidTags = tags.filter(
        (tag) => !STORE_TAGS_VALUES.includes(tag as any),
      );
      if (invalidTags.length > 0) {
        throw new AppError(`Invalid tags: ${invalidTags.join(', ')}`, 400);
      }
    }
  }
}
