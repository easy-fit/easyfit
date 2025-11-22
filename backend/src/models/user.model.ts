import { Schema, model } from 'mongoose';
import { User } from '../types/user.types';
import { AddressSchema } from '../schemas/common/address.schema';
import { RiderInfoSchema, MerchantInfoSchema, ManagerInfoSchema } from '../schemas/user/user.schemas';

const UserSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true, lowercase: true },
    surname: { type: String, required: true, trim: true, lowercase: true },
    email: { type: String, required: true, lowercase: true },
    passwordHash: { type: String },
    googleId: { type: String },
    role: {
      type: String,
      enum: ['customer', 'merchant', 'rider', 'admin', 'manager'],
      default: 'customer',
    },
    additionalInfo: {
      dni: { type: String, trim: true },
      dniType: {
        type: String,
        enum: ['DNI', 'CI', 'LC', 'LE'],
      },
      birthDate: { type: Date },
      phone: {
        areaCode: { type: String, trim: true },
        number: { type: String, trim: true },
      },
    },
    address: { type: AddressSchema },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    passwordChangedAt: { type: Date },
    refreshToken: { type: String, default: null },
    emailVerification: {
      code: { type: String },
      expires: { type: Date },
      verified: { type: Boolean, default: false },
      attempts: { type: Number, default: 0 },
    },
    riderInfo: { type: RiderInfoSchema },
    merchantInfo: { type: MerchantInfoSchema },
    managerInfo: { type: ManagerInfoSchema },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre('validate', function (next) {
  const user = this as any;

  const isRider = user.role === 'rider';
  const isMerchant = user.role === 'merchant';
  const isManager = user.role === 'manager';
  const isCustomerOrAdmin = user.role === 'customer' || user.role === 'admin';

  if (isRider && (!user.riderInfo || user.merchantInfo || user.managerInfo)) {
    return next(new Error('Riders must have riderInfo only'));
  }

  if (isMerchant && (!user.merchantInfo || user.riderInfo || user.managerInfo)) {
    return next(new Error('Merchants must have merchantInfo only'));
  }

  if (isManager && (!user.managerInfo || user.riderInfo || user.merchantInfo)) {
    return next(new Error('Managers must have managerInfo only'));
  }

  if (isCustomerOrAdmin && (user.riderInfo || user.merchantInfo || user.managerInfo)) {
    return next(new Error('Customers/Admins must not have role-specific info'));
  }

  next();
});

UserSchema.set('toJSON', {
  transform: (_doc, ret: Partial<User>) => {
    delete ret.passwordHash;
    delete ret.refreshToken;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  },
});

UserSchema.set('toObject', {
  transform: (_doc, ret: Partial<User>) => {
    delete ret.passwordHash;
    delete ret.refreshToken;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  },
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });

export const UserModel = model('User', UserSchema);
