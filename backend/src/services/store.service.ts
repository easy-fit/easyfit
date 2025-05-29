import { StoreModel } from '../models/store.model';
import { CreateStoreDTO, UpdateStoreDTO } from '../types/store.types';
import { AppError } from '../utils/appError';

export class StoreService {
  static async getStores() {
    return StoreModel.find();
  }

  static async getStoreById(storeId: string) {
    const store = await StoreModel.findById(storeId);
    this.ensureStoreExists(store);
    return store;
  }

  static async createStore(data: CreateStoreDTO) {
    return StoreModel.create(data);
  }

  static async updateStore(storeId: string, updates: UpdateStoreDTO) {
    const store = await StoreModel.findByIdAndUpdate(storeId, updates, {
      new: true,
    });

    this.ensureStoreExists(store);

    return store;
  }

  static async deleteStore(storeId: string) {
    const store = await StoreModel.findByIdAndDelete(storeId);
    this.ensureStoreExists(store);
  }

  private static ensureStoreExists(store: any): void {
    if (!store) {
      throw new AppError('Store not found', 404);
    }
  }
}
