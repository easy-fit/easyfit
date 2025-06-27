import { Request, Response } from 'express';
import { StoreService } from '../services/store/store.service';
import { catchAsync } from '../utils/catchAsync';
import {
  CreateStoreDTO,
  UpdateStoreDTO,
  StoreFilterOptions,
} from '../types/store.types';

export class StoreController {
  static getStores = catchAsync(async (req: Request, res: Response) => {
    const {
      tags,
      status,
      isOpen,
      rating,
      page = 1,
      lat,
      lng,
      distance,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    const filterOptions: StoreFilterOptions = {
      tags: tags
        ? Array.isArray(tags)
          ? tags.map((tag) => String(tag))
          : [String(tags)]
        : undefined,
      status: status as string,
      isOpen: isOpen === 'true' ? true : isOpen === 'false' ? false : undefined,
      page: Number(page),
      limit: Number(limit),
      sort: sort as string,
      rating: rating ? Number(rating) : undefined,
    };

    if (lat && lng) {
      filterOptions.nearLocation = {
        latitude: Number(lat),
        longitude: Number(lng),
        maxDistance: distance ? Number(distance) : undefined,
      };
    } else if (req.user?.address?.location?.coordinates) {
      filterOptions.nearLocation = {
        latitude: req.user.address.location.coordinates[1],
        longitude: req.user.address.location.coordinates[0],
        maxDistance: distance ? Number(distance) : undefined,
      };
    }

    const result = await StoreService.getStores(filterOptions);

    res.status(200).json({
      status: 'success',
      results: result.stores.length,
      pagination: result.pagination,
      data: {
        stores: result.stores,
      },
    });
  });

  static getStoreById = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const store = await StoreService.getStoreById(storeId);
    res.status(200).json({ store });
  });

  static getStoreBySlug = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.slug;
    const store = await StoreService.getStoreBySlug(storeId);
    res.status(200).json({ store });
  });

  static createStore = catchAsync(async (req: Request, res: Response) => {
    const data: CreateStoreDTO = req.body;
    const userId = req.user._id;
    const store = await StoreService.createStore(data, userId);
    res.status(201).json({ store });
  });

  static updateStore = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const data: UpdateStoreDTO = req.body;
    const store = await StoreService.updateStore(storeId, data);
    res.status(200).json({ store });
  });

  static deleteStore = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    await StoreService.deleteStore(storeId);
    res.status(204).json({ status: 'success' });
  });

  static uploadStoreAsset = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const assetType = req.params.assetType as 'logo' | 'banner';
    const { key, contentType } = req.body;

    if (!['logo', 'banner'].includes(assetType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset type. Must be "logo" or "banner"',
      });
    }

    const result = await StoreService.uploadStoreAsset(storeId, assetType, {
      key,
      contentType: contentType || 'image/jpeg',
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  static deleteStoreAsset = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const assetType = req.params.assetType as 'logo' | 'banner';

    if (!['logo', 'banner'].includes(assetType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset type. Must be "logo" or "banner"',
      });
    }

    const store = await StoreService.deleteStoreAsset(storeId, assetType);

    res.status(200).json({
      status: 'success',
      data: { store },
    });
  });
}
