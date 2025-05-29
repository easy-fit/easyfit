import { RiderAssignmentModel } from '../models/riderAssignment.model';
import { AppError } from '../utils/appError';
import {
  CreateRiderAssignmentDTO,
  UpdateRiderAssignmentDTO,
} from '../types/assignment.types';

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

  static async updateAssignment(
    assignmentId: string,
    updates: UpdateRiderAssignmentDTO,
  ) {
    const assignment = await RiderAssignmentModel.findByIdAndUpdate(
      assignmentId,
      updates,
      { new: true },
    );

    this.ensureAssignmentExists(assignment);

    return assignment;
  }

  static async deleteAssignment(assignmentId: string) {
    const assignment = await RiderAssignmentModel.findByIdAndDelete(
      assignmentId,
    );
    this.ensureAssignmentExists(assignment);
  }

  private static ensureAssignmentExists(assignment: any): void {
    if (!assignment) {
      throw new AppError('Rider assignment not found', 404);
    }
  }
}
