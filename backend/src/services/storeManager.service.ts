import { AppError } from '../utils/appError';
import { StoreManagerModel } from '../models/storeManager.model';
import { StoreModel } from '../models/store.model';
import { UserModel } from '../models/user.model';
import mongoose from 'mongoose';

export class StoreManagerService {
  // Get all managers for a specific store
  static async getStoreManagers(storeId: string) {
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      throw new AppError('Invalid store ID format', 400);
    }

    const store = await StoreModel.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    const assignments = await StoreManagerModel.find({ 
      storeId, 
      isActive: true 
    }).populate({
      path: 'managerId',
      select: 'name surname email role createdAt'
    }).populate({
      path: 'assignedBy',
      select: 'name surname email'
    }).lean();

    return assignments.map(assignment => ({
      ...assignment,
      manager: assignment.managerId,
      assignedByUser: assignment.assignedBy
    }));
  }

  // Get all stores assigned to a manager
  static async getManagerStores(managerId: string) {
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      throw new AppError('Invalid manager ID format', 400);
    }

    const assignments = await StoreManagerModel.find({ 
      managerId, 
      isActive: true 
    }).populate({
      path: 'storeId',
      select: 'name address status storeType customization'
    }).populate({
      path: 'assignedBy',
      select: 'name surname email'
    }).lean();

    return assignments.map(assignment => ({
      ...assignment,
      store: assignment.storeId,
      assignedByUser: assignment.assignedBy
    }));
  }

  // Assign manager to store
  static async assignManagerToStore(storeId: string, managerId: string, assignedBy: string) {
    if (!mongoose.Types.ObjectId.isValid(storeId) || 
        !mongoose.Types.ObjectId.isValid(managerId) || 
        !mongoose.Types.ObjectId.isValid(assignedBy)) {
      throw new AppError('Invalid ID format', 400);
    }

    // Verify store exists
    const store = await StoreModel.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    // Verify manager exists and has manager role
    const manager = await UserModel.findById(managerId);
    if (!manager || manager.role !== 'manager') {
      throw new AppError('Manager not found or invalid role', 404);
    }

    // Verify the person assigning owns the store
    if (store.merchantId.toString() !== assignedBy.toString()) {
      throw new AppError('You do not have permission to assign managers to this store', 403);
    }

    // Check if assignment already exists
    const existingAssignment = await StoreManagerModel.findOne({
      storeId,
      managerId,
      isActive: true
    });

    if (existingAssignment) {
      throw new AppError('Manager is already assigned to this store', 409);
    }

    // Create assignment
    const assignment = await StoreManagerModel.create({
      storeId,
      managerId,
      assignedBy,
      assignedAt: new Date(),
      isActive: true
    });

    // Update manager's managerInfo
    await UserModel.findByIdAndUpdate(managerId, {
      $addToSet: { 'managerInfo.assignedStores': storeId }
    });

    return assignment;
  }

  // Remove manager from store
  static async removeManagerFromStore(storeId: string, managerId: string, removedBy: string) {
    if (!mongoose.Types.ObjectId.isValid(storeId) || 
        !mongoose.Types.ObjectId.isValid(managerId) || 
        !mongoose.Types.ObjectId.isValid(removedBy)) {
      throw new AppError('Invalid ID format', 400);
    }

    // Verify store exists
    const store = await StoreModel.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    // Verify the person removing owns the store
    if (store.merchantId.toString() !== removedBy.toString()) {
      throw new AppError('You do not have permission to remove managers from this store', 403);
    }

    // Find the assignment to ensure it exists
    const assignment = await StoreManagerModel.findOne({
      storeId, 
      managerId, 
      isActive: true
    });

    if (!assignment) {
      throw new AppError('Manager assignment not found', 404);
    }

    // Delete the assignment record
    await StoreManagerModel.findByIdAndDelete(assignment._id);

    // Delete the user account
    await UserModel.findByIdAndDelete(managerId);

    return assignment;
  }

  // Get specific manager assignment
  static async getManagerAssignment(storeId: string, managerId: string) {
    if (!mongoose.Types.ObjectId.isValid(storeId) || !mongoose.Types.ObjectId.isValid(managerId)) {
      throw new AppError('Invalid ID format', 400);
    }

    const assignment = await StoreManagerModel.findOne({
      storeId,
      managerId,
      isActive: true
    }).populate({
      path: 'managerId',
      select: 'name surname email role createdAt'
    }).populate({
      path: 'storeId',
      select: 'name address status storeType'
    }).populate({
      path: 'assignedBy',
      select: 'name surname email'
    }).lean();

    if (!assignment) {
      throw new AppError('Manager assignment not found', 404);
    }

    return {
      ...assignment,
      manager: assignment.managerId,
      store: assignment.storeId,
      assignedByUser: assignment.assignedBy
    };
  }
}