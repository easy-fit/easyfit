import { Server as SocketIOServer } from 'socket.io';
import { SocketChannels } from '../../types/websocket.types';
import { RiderAssignmentService } from '../../services/riderAssignment.service';

interface TryPeriodUpdatePayload {
  orderId: string;
  type: 'try_period_started' | 'try_period_updated' | 'try_period_expired' | 'try_period_finalized';
  tryPeriod?: any;
  items?: any[];
  timestamp: Date;
}

export class TryPeriodHandler {
  constructor(private io: SocketIOServer, private channels: SocketChannels) {}

  public async emitTryPeriodUpdate(payload: TryPeriodUpdatePayload): Promise<void> {
    const orderChannel = this.channels.ORDER(payload.orderId);

    // Notify customer
    this.io.to(orderChannel).emit('try_period:update', {
      type: 'try_period_update',
      data: payload,
    });

    // Notify rider
    try {
      const assignment = await RiderAssignmentService.getAssignmentByOrderId(payload.orderId);
      if (assignment && assignment.riderId) {
        const riderChannel = this.channels.RIDER(assignment.riderId.toString());
        this.io.to(riderChannel).emit('try_period:update', {
          type: 'try_period_update',
          data: payload,
        });
      }
    } catch (error) {
      console.error(`Failed to notify rider for order ${payload.orderId}:`, error);
    }

    // Notify admin dashboard
    this.io.to(this.channels.ADMIN_DASHBOARD).emit('try_period:update', {
      type: 'try_period_update',
      data: payload,
    });

    console.log(`Try period update emitted for order ${payload.orderId}: ${payload.type}`);
  }
}
