import { Schema, model } from 'mongoose';

export interface StoreManager {
  _id: string;
  storeId: Schema.Types.ObjectId;
  managerId: Schema.Types.ObjectId;
  assignedBy: Schema.Types.ObjectId;
  assignedAt: Date;
  isActive: boolean;
}

const StoreManagerSchema = new Schema<StoreManager>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

StoreManagerSchema.index({ storeId: 1, managerId: 1 }, { unique: true });
StoreManagerSchema.index({ managerId: 1 });
StoreManagerSchema.index({ storeId: 1 });

export const StoreManagerModel = model('StoreManager', StoreManagerSchema);
