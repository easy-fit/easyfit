import { WalletTransactionModel } from '../models/walletTx.model';
import { AppError } from '../utils/appError';
import {
  CreateWalletTransactionDTO,
  UpdateWalletTransactionDTO,
} from '../types/walletTx.types';

export class WalletTransactionService {
  static async getTransactions() {
    return WalletTransactionModel.find();
  }

  static async getTransactionById(id: string) {
    const tx = await WalletTransactionModel.findById(id);
    this.ensureTransactionExists(tx);
    return tx;
  }

  static async createTransaction(data: CreateWalletTransactionDTO) {
    return WalletTransactionModel.create(data);
  }

  static async updateTransaction(
    id: string,
    updates: UpdateWalletTransactionDTO,
  ) {
    const tx = await WalletTransactionModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    this.ensureTransactionExists(tx);

    return tx;
  }

  static async deleteTransaction(id: string) {
    const tx = await WalletTransactionModel.findByIdAndDelete(id);
    this.ensureTransactionExists(tx);
  }

  private static ensureTransactionExists(tx: any): void {
    if (!tx) {
      throw new AppError('Transaction not found', 404);
    }
  }
}
