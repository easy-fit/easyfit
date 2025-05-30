import { Schema, model } from 'mongoose';
import { User } from '../types/user.types';
import { AddressSchema } from '../schemas/common/address.schema';
import {
  RiderInfoSchema,
  SellerInfoSchema,
} from '../schemas/user/user.schemas';

const UserSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true, lowercase: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['consumer', 'seller', 'rider', 'admin'],
      default: 'consumer',
    },
    emailVerified: { type: Boolean, default: false },
    birthDate: { type: Date, required: true },
    address: { type: AddressSchema },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    passwordChangedAt: { type: Date },
    refreshToken: { type: String, default: null },
    riderInfo: { type: RiderInfoSchema },
    sellerInfo: { type: SellerInfoSchema },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre('validate', function (next) {
  const user = this as any;

  const isRider = user.role === 'rider';
  const isSeller = user.role === 'seller';
  const isConsumerOrAdmin = user.role === 'consumer' || user.role === 'admin';

  if (isRider && (!user.riderInfo || user.sellerInfo)) {
    return next(new Error('Riders must have riderInfo and no sellerInfo'));
  }

  if (isSeller && (!user.sellerInfo || user.riderInfo)) {
    return next(new Error('Sellers must have sellerInfo and no riderInfo'));
  }

  if (isConsumerOrAdmin && (user.riderInfo || user.sellerInfo)) {
    return next(
      new Error('Consumers/Admins must not have riderInfo or sellerInfo'),
    );
  }

  next();
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });

export const UserModel = model('User', UserSchema);
