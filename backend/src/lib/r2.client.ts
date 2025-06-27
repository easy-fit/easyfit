import { S3Client } from '@aws-sdk/client-s3';
import { R2 } from '../config/env';

export const r2Client = new S3Client({
  region: R2.REGION,
  endpoint: `https://${R2.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2.ACCESS_KEY_ID,
    secretAccessKey: R2.SECRET_ACCESS_KEY,
  },
});
