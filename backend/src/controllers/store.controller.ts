import { Request, Response } from 'express';
import { StoreService } from '../services/store.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { CreateStoreDTO, UpdateStoreDTO } from '../types/store.types';

export class StoreController {
  static getStores = catchAsync(async (_req: Request, res: Response) => {
    const stores = await StoreService.getStores();
    res.status(200).json({ total: stores.length, stores });
  });

  static getStoreById = catchAsync(async (req: Request, res: Response) => {
    const store = await StoreService.getStoreById(req.params.id);
    res.status(200).json({ store });
  });

  static createStore = catchAsync(async (req: Request, res: Response) => {
    const dto: CreateStoreDTO = req.body;
    const store = await StoreService.createStore(dto);
    res.status(201).json({ store });
  });

  static updateStore = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const dto: UpdateStoreDTO = req.body;
    const store = await StoreService.updateStore(storeId, dto);
    res.status(200).json({ store });
  });

  static deleteStore = catchAsync(async (req: Request, res: Response) => {
    await StoreService.deleteStore(req.params.id);
    res.status(204).json({ status: 'success' });
  });
}
