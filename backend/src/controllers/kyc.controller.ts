import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { KYCService } from '../services/kyc.service';

export class KYCController {
  static createApplicant = catchAsync(async (req: Request, res: Response) => {
    const { _id, role } = req.user;

    const applicant = await KYCService.createApplicant(_id, role);
    res.status(201).json({ status: 'success', data: { applicant_id: applicant } });
  });

  static generateWebSDKLink = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;

    const sdkLink = await KYCService.generateWebSDKLink(userId);
    res.status(200).json({ status: 'success', data: { session_link: sdkLink } });
  });

  static handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    await KYCService.handleWebhook(payload);
    res.status(200).json({ status: 'success' });
  });
}
