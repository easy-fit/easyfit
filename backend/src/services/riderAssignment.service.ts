import { RiderAssignmentModel } from '../models/riderAssignment.model';
import { AppError } from '../utils/appError';
import { CreateRiderAssignmentDTO, UpdateRiderAssignmentDTO } from '../types/assignment.types';

export class RiderAssignmentService {
  static async getAssignments() {
    return RiderAssignmentModel.find();
  }

  static async getAssignmentById(assignmentId: string) {
    const assignment = await RiderAssignmentModel.findById(assignmentId);
    this.ensureAssignmentExists(assignment);
    return assignment;
  }

  static async createAssignment(data: CreateRiderAssignmentDTO) {
    return RiderAssignmentModel.create(data);
  }

  static async updateAssignment(assignmentId: string, data: UpdateRiderAssignmentDTO) {
    const assignment = await RiderAssignmentModel.findByIdAndUpdate(assignmentId, data, { new: true });

    this.ensureAssignmentExists(assignment);

    return assignment;
  }

  static async deleteAssignment(assignmentId: string) {
    const assignment = await RiderAssignmentModel.findByIdAndDelete(assignmentId);
    this.ensureAssignmentExists(assignment);
  }

  static async getAssignmentByOrderId(orderId: string) {
    const assignment = await RiderAssignmentModel.findOne({ orderId });
    return assignment;
  }

  static async getActiveAssignmentsByRider(riderId: string) {
    return RiderAssignmentModel.find({
      riderId,
      status: { $in: ['assigned', 'picked_up', 'in_transit'] },
    });
  }

  static async updateAssignmentStatus(orderId: string, riderId: string, status: string) {
    const updateData: any = { status };

    switch (status) {
      case 'picked_up':
        updateData.pickedUpAt = new Date();
        break;
      case 'delivered':
        updateData.deliveredAt = new Date();
        break;
    }

    const assignment = await RiderAssignmentModel.findOneAndUpdate({ orderId, riderId }, updateData, { new: true });

    return assignment;
  }

  private static ensureAssignmentExists(assignment: any): void {
    if (!assignment) {
      throw new AppError('Rider assignment not found', 404);
    }
  }
}
