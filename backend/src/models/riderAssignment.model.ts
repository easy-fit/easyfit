import { Schema, model } from 'mongoose';
import { RiderAssignment } from '../types/assignment.types';

const RiderAssignmentSchema = new Schema<RiderAssignment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    riderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
      default: 'assigned',
    },
    assignedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true },
);

export const RiderAssignmentModel = model(
  'RiderAssignment',
  RiderAssignmentSchema,
);
