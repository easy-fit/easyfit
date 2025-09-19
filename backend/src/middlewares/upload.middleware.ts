import multer from 'multer';
import { AppError } from '../utils/appError';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for Excel files only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.originalname.endsWith('.xlsx') ||
    file.originalname.endsWith('.xls')
  ) {
    cb(null, true);
  } else {
    cb(new AppError('Only Excel files (.xlsx, .xls) are allowed', 400));
  }
};

// Create multer instance with configuration
export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow 1 file
  }
}).any(); // Accept any fields to debug the issue

// Custom middleware to extract storeId after multer processing
export const extractStoreIdFromForm = (req: any, res: any, next: any) => {
  // After multer processes the form, storeId should be in req.body
  if (!req.body || !req.body.storeId) {
    return res.status(400).json({
      status: 'error',
      message: 'Store ID is required in form data'
    });
  }
  next();
};

// Error handling middleware for multer
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files. Only one file is allowed.'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: `Upload error: ${error.message}`
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  }

  next(error);
};