import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { StoreManagerService } from '../services/storeManager.service';

export class StoreManagerController {
  // Get all managers for a specific store
  static getStoreManagers = catchAsync(async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const managers = await StoreManagerService.getStoreManagers(storeId);

    res.status(200).json({
      status: 'success',
      data: { managers },
    });
  });

  // Get all stores assigned to current manager
  static getManagerStores = catchAsync(async (req: Request, res: Response) => {
    const managerId = req.user._id.toString();
    const stores = await StoreManagerService.getManagerStores(managerId);

    res.status(200).json({
      status: 'success',
      data: { stores },
    });
  });

  // Assign manager to store
  static assignManagerToStore = catchAsync(async (req: Request, res: Response) => {
    const { storeId, managerId } = req.body;
    const assignedBy = req.user._id.toString();

    const assignment = await StoreManagerService.assignManagerToStore(storeId, managerId, assignedBy);

    res.status(201).json({
      status: 'success',
      message: 'Manager assigned to store successfully',
      data: { assignment },
    });
  });

  // Remove manager from store
  static removeManagerFromStore = catchAsync(async (req: Request, res: Response) => {
    const { storeId, managerId } = req.params;
    const removedBy = req.user._id.toString();

    await StoreManagerService.removeManagerFromStore(storeId, managerId, removedBy);

    res.status(200).json({
      status: 'success',
      message: 'Manager removed from store successfully',
    });
  });

  // Get manager assignment details
  static getManagerAssignment = catchAsync(async (req: Request, res: Response) => {
    const { storeId, managerId } = req.params;

    const assignment = await StoreManagerService.getManagerAssignment(storeId, managerId);

    res.status(200).json({
      status: 'success',
      data: { assignment },
    });
  });
}