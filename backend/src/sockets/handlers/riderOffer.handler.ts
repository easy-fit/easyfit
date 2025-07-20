import { Server as SocketIOServer } from 'socket.io';
import {
  AuthenticatedSocket,
  SocketChannels,
  RiderOfferPayload,
  RiderOfferResponse,
} from '../../types/websocket.types';
import { RiderAssignmentOrchestrator } from '../../services/riderAssignmentOrchestrator.service';

export class RiderOfferHandler {
  private activeOffers: Map<string, NodeJS.Timeout> = new Map();

  constructor(private io: SocketIOServer, private channels: SocketChannels) {}

  public sendOfferToRider(riderId: string, payload: RiderOfferPayload): Promise<boolean> {
    return new Promise((resolve) => {
      const riderChannel = this.channels.RIDER(riderId);
      const offerId = `${payload.order._id}-${riderId}`;

      const timeout = setTimeout(() => {
        this.activeOffers.delete(offerId);
        console.log(`Rider offer timeout for order ${payload.order._id}, rider ${riderId}`);
        resolve(false);
      }, payload.timeout);

      this.activeOffers.set(offerId, timeout);

      this.io.to(riderChannel).emit('rider:offer', {
        type: 'delivery_offer',
        data: payload,
        offerId,
      });

      console.log(`Delivery offer sent to rider ${riderId} for order ${payload.order._id}`);

      const responseHandler = (response: RiderOfferResponse) => {
        if (response.orderId === payload.order._id && response.riderId === riderId) {
          const timeout = this.activeOffers.get(offerId);
          if (timeout) {
            clearTimeout(timeout);
            this.activeOffers.delete(offerId);
          }
          resolve(response.accepted);
        }
      };

      this.io.on('rider:offer:response', responseHandler);

      setTimeout(() => {
        this.io.off('rider:offer:response', responseHandler);
      }, payload.timeout + 1000);
    });
  }

  public handleRiderResponse(socket: AuthenticatedSocket, response: RiderOfferResponse): void {
    if (socket.userRole !== 'rider') {
      socket.emit('error', {
        message: 'Unauthorized: Only riders can respond to offers',
      });
      return;
    }

    if (socket.riderId !== response.riderId) {
      socket.emit('error', {
        message: 'Unauthorized: Cannot respond to offers for other riders',
      });
      return;
    }

    const offerId = `${response.orderId}-${response.riderId}`;

    const timeout = this.activeOffers.get(offerId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeOffers.delete(offerId);
    }

    if (response.accepted) {
      RiderAssignmentOrchestrator.handleRiderAcceptance(response.orderId, response.riderId).catch((error) => {
        console.error('Error handling rider acceptance:', error);
      });
    }

    // Notify admin dashboard
    this.io.to(this.channels.ADMIN_DASHBOARD).emit('rider:offer_response', {
      type: 'rider_offer_response',
      data: response,
    });

    console.log(
      `Rider ${response.riderId} ${response.accepted ? 'ACCEPTED' : 'REJECTED'} offer for order ${response.orderId}`,
    );
  }

  public async offerToRidersSequentially(riderIds: string[], offerPayload: RiderOfferPayload): Promise<string | null> {
    for (const riderId of riderIds) {
      console.log(`Offering order ${offerPayload.order._id} to rider ${riderId}`);

      const riderSpecificPayload: RiderOfferPayload = {
        ...offerPayload,
        riderId,
      };

      const accepted = await this.sendOfferToRider(riderId, riderSpecificPayload);

      if (accepted) {
        console.log(`Rider ${riderId} accepted order ${offerPayload.order._id}`);
        return riderId;
      }
    }

    console.log(`No riders accepted order ${offerPayload.order._id}`);
    return null;
  }

  public cleanupExpiredOffers(): void {
    console.log(`Active offers: ${this.activeOffers.size}`);
  }
}
