import { Types } from 'mongoose';

export type RiderAssignmentStatus =
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface RiderAssignment {
  orderId: Types.ObjectId;
  riderId: Types.ObjectId;
  status: RiderAssignmentStatus;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
}

export interface CreateRiderAssignmentDTO {
  orderId: Types.ObjectId;
  riderId: Types.ObjectId;
  status?: RiderAssignmentStatus;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
}

export interface UpdateRiderAssignmentDTO {
  status?: RiderAssignmentStatus;
  pickedUpAt?: Date;
  deliveredAt?: Date;
}
