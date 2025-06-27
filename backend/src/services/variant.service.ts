import { VariantModel } from '../models/variant.model';
import { AppError } from '../utils/appError';
import {
  CreateVariantDTO,
  UpdateVariantDTO,
  VariantImage,
} from '../types/variant.types';
import { R2Service } from './r2.service';
import { FileItem } from '../types/storage.types';
import { R2 } from '../config/env';

const { BUCKET_PRODUCTS } = R2;

export class VariantService {
  static async getVariants() {
    return VariantModel.find();
  }

  static async getVariantById(variantId: string) {
    const variant = await VariantModel.findById(variantId);
    this.ensureVariantExists(variant);
    return variant;
  }

  static async getVariantsByProductId(productId: string) {
    const variants = await VariantModel.find({ productId })
      .select('_id')
      .lean();

    return variants.length > 0;
  }

  static async createVariant(productId: string, data: CreateVariantDTO) {
    const existingVariants = await VariantModel.find({ productId });
    if (existingVariants.length === 0) {
      data.isDefault = true;
    } else if (data.isDefault) {
      await VariantModel.updateMany(
        { productId, isDefault: true },
        { $set: { isDefault: false } },
      );
    }

    const images = data.images.map((img) => ({
      key: img.key,
      contentType: img.contentType,
    })) as FileItem[];

    const signedUrls = await R2Service.getSignedUrls({
      bucket: R2.BUCKET_PRODUCTS,
      typePrefix: 'products',
      files: images,
    });

    data.images = data.images.map((img, idx) => ({
      ...img,
      key: signedUrls[idx].key_img,
    }));

    const variant = await VariantModel.create({
      ...data,
      productId,
    });

    return { variant, signedUrls };
  }

  static async createManyVariants(productId: string, data: CreateVariantDTO[]) {
    let defaultIndex = data.findIndex((v) => v.isDefault);
    if (defaultIndex === -1) defaultIndex = 0;

    const variantsToInsert = data.map((variant, idx) => ({
      ...variant,
      productId,
      isDefault: idx === defaultIndex,
    }));

    return VariantModel.insertMany(variantsToInsert);
  }

  static async updateVariant(variantId: string, data: UpdateVariantDTO) {
    const variant = await VariantModel.findById(variantId);
    this.ensureVariantExists(variant);

    if (data.isDefault) {
      await VariantModel.updateMany(
        { productId: variant?.productId, isDefault: true },
        { $set: { isDefault: false } },
      );
    }

    Object.assign(!variant, data);
    await variant?.save();

    return variant;
  }

  static async deleteVariant(variantId: string) {
    const variant = await VariantModel.findByIdAndDelete(variantId);
    this.ensureVariantExists(variant);

    const imageKeysToDelete = variant!.images.map((img) => img.key);
    if (imageKeysToDelete.length > 0) {
      Promise.all(
        imageKeysToDelete.map((key) =>
          R2Service.deleteObject(BUCKET_PRODUCTS, key).catch((err) =>
            console.error(`Failed to delete image ${key}:`, err),
          ),
        ),
      ).catch((err) => console.error('Error deleting images:', err));
    }
  }

  static async checkStockAvailable(variantId: string, requestedQty: number) {
    const variant = await VariantModel.findById(variantId).select('stock');
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }
    if (variant.stock < requestedQty) {
      throw new AppError('Not enough stock available', 400);
    }
  }

  static async addImageToVariant(variantId: string, data: VariantImage) {
    const variant = await VariantModel.findById(variantId);
    this.ensureVariantExists(variant);

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
      order: data.order || variant!.images.length + 1,
      contentType: data.contentType || 'image/jpeg',
    };

    variant!.images.push(newImage);

    await variant!.save();

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
    this.ensureVariantExists(variant);

    let removed = false;
    variant!.images = variant!.images.filter((img) => {
      if (img.key === key) {
        removed = true;
        return false;
      }
      return true;
    });

    if (!removed) {
      throw new AppError('Image not found in this variant', 404);
    }

    await variant!.save();
    R2Service.deleteObject(BUCKET_PRODUCTS, key).catch((err) =>
      console.error(`Error deleting image ${key} from R2:`, err),
    );
  }

  private static ensureVariantExists(variant: any): void {
    if (!variant) {
      throw new AppError('Variant not found', 404);
    }
  }
}
