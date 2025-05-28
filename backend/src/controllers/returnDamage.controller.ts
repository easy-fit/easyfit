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
    const request = await ReturnDamageService.getRequestById(req.params.id);
    res.status(200).json({ request });
  });

  static createRequest = catchAsync(async (req: Request, res: Response) => {
    const dto: CreateReturnDamageDTO = req.body;
    const request = await ReturnDamageService.createRequest(dto);
    res.status(201).json({ request });
  });

  static updateRequest = catchAsync(async (req: Request, res: Response) => {
    const dto: UpdateReturnDamageDTO = req.body;
    const request = await ReturnDamageService.updateRequest(req.params.id, dto);
    res.status(200).json({ request });
  });
}
