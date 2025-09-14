import { StoreModel } from '../../models/store.model';
import { AppError } from '../../utils/appError';
import { R2Service } from '../r2.service';
import { FileItem } from '../../types/storage.types';
import { R2 } from '../../config/env';
import { DocumentType, TaxDocument } from '../../types/store.types';
import { v4 as uuidv4 } from 'uuid';

const { BUCKET_STORE_TAX } = R2;

export class StoreTaxDocumentService {
  /**
   * Upload a tax document to R2 and update store billing
   */
  static async uploadTaxDocument(
    storeId: string, 
    documentData: { fileName: string; type: DocumentType }
  ) {
    const store = await StoreModel.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    // Validate document type
    const allowedTypes: DocumentType[] = ['afip_certificate', 'monotributo_receipt', 'other'];
    if (!allowedTypes.includes(documentData.type)) {
      throw new AppError('Invalid document type', 400);
    }

    // Determine content type based on file extension
    const fileExtension = documentData.fileName.toLowerCase().split('.').pop();
    let contentType = 'application/pdf'; // Default
    
    if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      contentType = 'image/jpeg';
    } else if (fileExtension === 'png') {
      contentType = 'image/png';
    } else if (fileExtension !== 'pdf') {
      throw new AppError('Only PDF, JPG, and PNG files are allowed', 400);
    }

    const fileItem: FileItem = {
      key: documentData.fileName,
      contentType,
    };

    const signedUrls = await R2Service.getSignedUrls({
      bucket: BUCKET_STORE_TAX,
      typePrefix: 'tax-documents',
      files: [fileItem],
    });

    if (!signedUrls || signedUrls.length === 0) {
      throw new AppError('Failed to generate upload URL', 500);
    }

    const signedUrl = signedUrls[0];

    // Create new tax document entry
    const newDocument: TaxDocument = {
      id: uuidv4(),
      name: documentData.fileName,
      type: documentData.type,
      fileKey: signedUrl.key_img,
      uploadedAt: new Date(),
      status: 'pending',
      size: 0, // Will be set when frontend provides file size
    };

    // Add document to store billing
    if (!store.billing) {
      throw new AppError('Store billing information not found', 400);
    }

    // Use findByIdAndUpdate to avoid full document validation
    const updatedStore = await StoreModel.findByIdAndUpdate(
      storeId,
      {
        $push: { 'billing.taxDocuments': newDocument },
        $set: { 'billing.lastUpdatedAt': new Date() },
      },
      { new: true, runValidators: false }
    );

    if (!updatedStore) {
      throw new AppError('Failed to update store', 500);
    }

    return {
      billing: updatedStore.billing,
      uploadInfo: {
        key: signedUrl.key_img,
        url: signedUrl.url,
      },
    };
  }

  /**
   * Delete a tax document from store and R2
   */
  static async deleteTaxDocument(storeId: string, documentId: string) {
    const store = await StoreModel.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    if (!store.billing) {
      throw new AppError('Store billing information not found', 400);
    }

    // Find and remove the document
    const documentIndex = store.billing.taxDocuments.findIndex(
      (doc) => doc.id === documentId
    );

    if (documentIndex === -1) {
      throw new AppError('Tax document not found', 404);
    }

    const documentToDelete = store.billing.taxDocuments[documentIndex];
    
    // Remove from database using findByIdAndUpdate to avoid validation
    const updatedStore = await StoreModel.findByIdAndUpdate(
      storeId,
      {
        $pull: { 'billing.taxDocuments': { id: documentId } },
        $set: { 'billing.lastUpdatedAt': new Date() },
      },
      { new: true, runValidators: false }
    );

    if (!updatedStore) {
      throw new AppError('Failed to update store', 500);
    }

    // Delete from R2 (async, don't block response)
    if (documentToDelete.fileKey) {
      R2Service.deleteObject(BUCKET_STORE_TAX, documentToDelete.fileKey).catch((err) =>
        console.error(`Error deleting tax document ${documentToDelete.fileKey} from R2:`, err)
      );
    }

    return { billing: updatedStore.billing };
  }

  /**
   * Update document metadata after successful upload
   */
  static async updateDocumentMetadata(
    storeId: string,
    documentId: string,
    metadata: { size: number }
  ) {
    const store = await StoreModel.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    if (!store.billing) {
      throw new AppError('Store billing information not found', 400);
    }

    const document = store.billing.taxDocuments.find((doc) => doc.id === documentId);
    if (!document) {
      throw new AppError('Tax document not found', 404);
    }

    // Update metadata using findOneAndUpdate to avoid validation issues
    const updatedStore = await StoreModel.findOneAndUpdate(
      { _id: storeId, 'billing.taxDocuments.id': documentId },
      {
        $set: {
          'billing.taxDocuments.$.size': metadata.size,
          'billing.lastUpdatedAt': new Date(),
        },
      },
      { new: true, runValidators: false }
    );

    if (!updatedStore) {
      throw new AppError('Failed to update document metadata', 500);
    }

    return { billing: updatedStore.billing };
  }

  /**
   * Update document status (for admin approval workflow)
   */
  static async updateDocumentStatus(
    storeId: string,
    documentId: string,
    statusData: { status: 'pending' | 'approved' | 'rejected'; rejectionReason?: string }
  ) {
    const store = await StoreModel.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    if (!store.billing) {
      throw new AppError('Store billing information not found', 400);
    }

    const document = store.billing.taxDocuments.find((doc) => doc.id === documentId);
    if (!document) {
      throw new AppError('Tax document not found', 404);
    }

    // Update status using findOneAndUpdate to avoid validation issues
    const updateData: any = {
      'billing.taxDocuments.$.status': statusData.status,
      'billing.lastUpdatedAt': new Date(),
    };

    if (statusData.rejectionReason) {
      updateData['billing.taxDocuments.$.rejectionReason'] = statusData.rejectionReason;
    }

    const updatedStore = await StoreModel.findOneAndUpdate(
      { _id: storeId, 'billing.taxDocuments.id': documentId },
      { $set: updateData },
      { new: true, runValidators: false }
    );

    if (!updatedStore) {
      throw new AppError('Failed to update document status', 500);
    }

    return { billing: updatedStore.billing };
  }

  /**
   * Clean up orphaned tax documents (documents not referenced by any store)
   * This method can be used in cleanup jobs
   */
  static async cleanupOrphanedDocuments(): Promise<string[]> {
    // Get all tax document file keys from all stores
    const stores = await StoreModel.find({ 
      'billing.taxDocuments': { $exists: true, $not: { $size: 0 } } 
    });

    const usedFileKeys = new Set<string>();
    
    stores.forEach(store => {
      if (store.billing?.taxDocuments) {
        store.billing.taxDocuments.forEach(doc => {
          if (doc.fileKey) {
            usedFileKeys.add(doc.fileKey);
          }
        });
      }
    });

    // Note: This is a simplified version. In a production environment,
    // you would need to list all objects in the R2 bucket and compare
    // against the usedFileKeys set to identify orphaned files.
    // For now, we return the used keys for monitoring purposes.
    
    return Array.from(usedFileKeys);
  }
}