export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: UploadProgress;
  error?: string;
}

export interface FileUploadItem {
  file: File;
  signedUrl: string;
  key: string;
  state: UploadState;
}

export interface ImageUploadResult {
  success: boolean;
  key: string;
  error?: string;
}

export interface BatchUploadResult {
  results: ImageUploadResult[];
  allSuccessful: boolean;
  failedCount: number;
  successCount: number;
}