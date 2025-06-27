import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '../lib/r2.client';
import crypto from 'crypto';
import { SignUrlsRequest, SignedUrlResult } from '../types/storage.types';

export class R2Service {
  static async deleteObject(bucket: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await r2Client.send(command);
  }

  // Generates signed URLs for uploading multiple files to R2.
  static async getSignedUrls(
    params: SignUrlsRequest,
  ): Promise<SignedUrlResult[]> {
    const { bucket, typePrefix, files } = params;

    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const results = await Promise.all(
      files.map(async ({ key, contentType }) => {
        const key_img = this.generateUniqueFileName(key, typePrefix);
        const url = await this.getUploadUrl(bucket, key_img, contentType);

        return { key_img, url };
      }),
    );

    return results;
  }

  private static generateUniqueFileName(
    key: string,
    typePrefix: string,
  ): string {
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const cleanFileName = key.replace(/[^a-zA-Z0-9.-]/g, '_');

    return `${typePrefix}/${timestamp}-${uniqueId}-${cleanFileName}`;
  }

  //Generates a signed URL for uploading an object to R2.
  private static async getUploadUrl(
    bucket: string,
    key: string,
    contentType: string,
    expiresIn = 60 * 5,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn });
    return url;
  }
}
