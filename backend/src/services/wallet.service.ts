import { WalletModel } from '../models/wallet.model';
import { AppError } from '../utils/appError';
import { CreateWalletDTO, UpdateWalletDTO } from '../types/wallet.types';

export class WalletService {
  static async getWallets() {
    return WalletModel.find();
  }

  static async getWalletById(walletId: string) {
    const wallet = await WalletModel.findById(walletId);
    this.ensureWalletExists(wallet);
    return wallet;
  }

  static async createWallet(data: CreateWalletDTO) {
    return WalletModel.create(data);
  }

  static async updateWallet(walletId: string, updates: UpdateWalletDTO) {
    const wallet = await WalletModel.findByIdAndUpdate(walletId, updates, {
      new: true,
    });

    this.ensureWalletExists(wallet);

    return wallet;
  }

  static async deleteWallet(walletId: string) {
    const wallet = await WalletModel.findByIdAndDelete(walletId);
    this.ensureWalletExists(wallet);
  }

  private static ensureWalletExists(wallet: any): void {
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }
  }
}
