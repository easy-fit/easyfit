import { Request, Response } from 'express';
import { ReturnDamageService } from '../services/returnDamage.service';
import { catchAsync } from '../utils/catchAsync';
import {
  CreateReturnDamageDTO,
  UpdateReturnDamageDTO,
} from '../types/returnDamage.types';

export class ReturnDamageController {
  static getRequests = catchAsync(async (_req: Request, res: Response) => {
    const requests = await ReturnDamageService.getRequests();
    res.status(200).json({ total: requests.length, requests });
  });

  static getRequestById = catchAsync(async (req: Request, res: Response) => {
    const requestId = req.params.id;
    const request = await ReturnDamageService.getRequestById(requestId);
    res.status(200).json({ request });
  });

  static createRequest = catchAsync(async (req: Request, res: Response) => {
    const data: CreateReturnDamageDTO = req.body;
    const request = await ReturnDamageService.createRequest(data);
    res.status(201).json({ request });
  });

  static updateRequest = catchAsync(async (req: Request, res: Response) => {
    const data: UpdateReturnDamageDTO = req.body;
    const requestId = req.params.id;
    const request = await ReturnDamageService.updateRequest(requestId, data);
    res.status(200).json({ request });
  });

  static deleteRequest = catchAsync(async (req: Request, res: Response) => {
    const requestId = req.params.id;
    await ReturnDamageService.deleteRequest(requestId);
    res.status(204).send();
  });
}
