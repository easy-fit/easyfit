import { StoreModel } from '../../models/store.model';
import { AppError } from '../../utils/appError';
import { R2Service } from '../r2.service';
import { FileItem } from '../../types/storage.types';
import { R2 } from '../../config/env';

export class StoreAssetService {
  static async uploadAsset(
    storeId: string,
    assetType: 'logo' | 'banner',
    fileData: { key: string; contentType: string },
  ) {
    const store = await StoreModel.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    const fileItem: FileItem = {
      key: fileData.key,
      contentType: fileData.contentType,
    };

    const signedUrls = await R2Service.getSignedUrls({
      bucket: R2.BUCKET_ASSETS,
      typePrefix: 'assets',
      files: [fileItem],
    });

    if (!signedUrls || signedUrls.length === 0) {
      throw new AppError('Failed to generate upload URL', 500);
    }

    const signedUrl = signedUrls[0];

    // Delete old asset if it exists
    const oldAssetKey =
      assetType === 'logo'
        ? store?.customization?.logoUrl
        : store?.customization?.bannerUrl;

    if (oldAssetKey) {
      R2Service.deleteObject(R2.BUCKET_ASSETS, oldAssetKey).catch((err) =>
        console.error(`Error deleting old ${assetType}:`, err),
      );
    }

    // Update store with new asset URL
    const updateData = {
      [`customization.${assetType}Url`]: signedUrl.key_img,
    };

    const updatedStore = await StoreModel.findByIdAndUpdate(
      storeId,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    return {
      store: updatedStore,
      uploadInfo: {
        key: signedUrl.key_img,
        url: signedUrl.url,
      },
    };
  }

  static async deleteAsset(storeId: string, assetType: 'logo' | 'banner') {
    const store = await StoreModel.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    const assetKey =
      assetType === 'logo'
        ? store?.customization?.logoUrl
        : store?.customization?.bannerUrl;

    if (!assetKey) {
      throw new AppError(`No ${assetType} found for this store`, 404);
    }

    // Remove asset URL from store
    const updateData = {
      [`customization.${assetType}Url`]: null,
    };

    const updatedStore = await StoreModel.findByIdAndUpdate(
      storeId,
      { $unset: updateData },
      { new: true },
    );

    // Delete from R2
    R2Service.deleteObject(R2.BUCKET_ASSETS, assetKey).catch((err) =>
      console.error(`Error deleting ${assetType} from R2:`, err),
    );

    return updatedStore;
  }
}