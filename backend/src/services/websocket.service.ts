import { WebSocketOrchestrator } from '../sockets/websocket.orchestrator';
import {
  OrderNotificationPayload,
  RiderOfferPayload,
  OrderStatusUpdatePayload,
  DeliveryTrackingPayload,
} from '../types/websocket.types';

export class WebSocketService {
  private static getOrchestrator(): WebSocketOrchestrator {
    const orchestrator = (global as any).wsOrchestrator as WebSocketOrchestrator;
    if (!orchestrator) {
      throw new Error('WebSocket orchestrator not initialized');
    }
    return orchestrator;
  }

  // Order notification methods
  static notifyStoreOfNewOrder(payload: OrderNotificationPayload, storeId: string): void {
    const orchestrator = this.getOrchestrator();
    orchestrator.getOrderNotificationHandler().notifyStoreOfNewOrder(payload, storeId);
  }

  static emitOrderStatusUpdate(payload: OrderStatusUpdatePayload): void {
    const orchestrator = this.getOrchestrator();
    orchestrator.getOrderNotificationHandler().emitOrderStatusUpdate(payload);
  }

  // Rider offer methods
  static async offerToRidersSequentially(riderIds: string[], offerPayload: RiderOfferPayload): Promise<string | null> {
    const orchestrator = this.getOrchestrator();
    return orchestrator.getRiderOfferHandler().offerToRidersSequentially(riderIds, offerPayload);
  }

  static async sendOfferToRider(riderId: string, payload: RiderOfferPayload): Promise<boolean> {
    const orchestrator = this.getOrchestrator();
    return orchestrator.getRiderOfferHandler().sendOfferToRider(riderId, payload);
  }

  // Delivery tracking methods
  static emitDeliveryUpdate(payload: DeliveryTrackingPayload): void {
    const orchestrator = this.getOrchestrator();
    orchestrator.getDeliveryTrackingHandler().emitDeliveryUpdate(payload);
  }

  // Try period methods
  static async emitTryPeriodUpdate(payload: any): Promise<void> {
    const orchestrator = this.getOrchestrator();
    await orchestrator.getTryPeriodHandler().emitTryPeriodUpdate(payload);
  }

  // Rider cancellation methods
  static emitRiderCancellation(orderId: string, riderId: string, reason?: string): void {
    const orchestrator = this.getOrchestrator();
    orchestrator.getRiderCancellationHandler().emitRiderCancellation(orderId, riderId, reason);
  }

  // Utility method to get the IO instance for custom emissions
  static getIO() {
    const orchestrator = this.getOrchestrator();
    return orchestrator.getIO();
  }
}
