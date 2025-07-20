import { VariantModel } from '../../models/variant.model';
import { AppError } from '../../utils/appError';
import { R2Service } from '../r2.service';
import { FileItem } from '../../types/storage.types';
import { VariantImage } from '../../types/variant.types';
import { R2 } from '../../config/env';

const { BUCKET_PRODUCTS } = R2;

export class VariantImageService {
  static async addImageToVariant(variantId: string, data: VariantImage) {
    const variant = await VariantModel.findById(variantId);
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    const fileItem: FileItem = {
      key: data.key,
      contentType: data.contentType || 'image/jpeg',
    };

    const signedUrls = await R2Service.getSignedUrls({
      bucket: BUCKET_PRODUCTS,
      typePrefix: 'products',
      files: [fileItem],
    });

    if (!signedUrls || signedUrls.length === 0) {
      throw new AppError('Failed to generate upload URL', 500);
    }

    const signedUrl = signedUrls[0];

    const newImage: VariantImage = {
      key: signedUrl.key_img,
      altText: data.altText || 'Product image',
      order: data.order || variant.images.length + 1,
      contentType: data.contentType || 'image/jpeg',
    };

    variant.images.push(newImage);
    await variant.save();

    return {
      variant,
      uploadInfo: {
        key: signedUrl.key_img,
        url: signedUrl.url,
      },
    };
  }

  static async deleteVariantImage(variantId: string, key: string) {
    const variant = await VariantModel.findById(variantId);
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    let removed = false;
    variant.images = variant.images.filter((img) => {
      if (img.key === key) {
        removed = true;
        return false;
      }
      return true;
    });

    if (!removed) {
      throw new AppError('Image not found in this variant', 404);
    }

    await variant.save();

    // Delete from R2 asynchronously
    R2Service.deleteObject(BUCKET_PRODUCTS, key).catch((err) =>
      console.error(`Error deleting image ${key} from R2:`, err),
    );

    return variant;
  }

  static async processVariantImages(images: any[]) {
    const imageFiles = images.map((img) => ({
      key: img.key,
      contentType: img.contentType,
    })) as FileItem[];

    const signedUrls = await R2Service.getSignedUrls({
      bucket: BUCKET_PRODUCTS,
      typePrefix: 'products',
      files: imageFiles,
    });

    const processedImages = images.map((img, idx) => ({
      ...img,
      key: signedUrls[idx].key_img,
    }));

    return {
      processedImages,
      signedUrls,
    };
  }

  static async deleteVariantImages(imageKeys: string[]) {
    if (imageKeys.length > 0) {
      Promise.all(
        imageKeys.map((key) =>
          R2Service.deleteObject(BUCKET_PRODUCTS, key).catch((err) =>
            console.error(`Failed to delete image ${key}:`, err),
          ),
        ),
      ).catch((err) => console.error('Error deleting images:', err));
    }
  }
}
