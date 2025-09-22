import { WebSocketService } from './websocket.service';
import { EmailService } from './email.service';

export interface ErrorContext {
  orderId?: string;
  riderId?: string;
  storeId?: string;
  userId?: string;
  operation: string;
  stage: string;
  originalError: Error;
  metadata?: any;
}

export interface RetryOperation {
  operation: () => Promise<any>;
  maxRetries: number;
  delay: number;
  backoff: boolean;
  context: ErrorContext;
}

export interface FallbackStrategy {
  execute: () => Promise<any>;
  description: string;
}

export class ErrorHandlingService {
  private static readonly MAX_RETRY_DELAY = 30000; // 30 seconds
  private static readonly CRITICAL_OPERATIONS = [
    'payment_settlement',
    'rider_assignment',
    'order_status_transition',
    'try_period_finalization',
  ];

  /**
   * Execute operation with retry logic and fallback strategies
   */
  static async executeWithRetry<T>(operation: RetryOperation, fallbacks?: FallbackStrategy[]): Promise<T> {
    let lastError: Error = new Error('Unknown error occurred');

    for (let attempt = 0; attempt <= operation.maxRetries; attempt++) {
      try {
        const result = await operation.operation();

        if (attempt > 0) {
          // Operation succeeded after retry
          this.notifyAdminOfRecovery(operation.context, attempt);
        }

        return result;
      } catch (error: any) {
        lastError = error;

        if (attempt < operation.maxRetries) {
          const delay = this.calculateDelay(operation.delay, attempt, operation.backoff);

          console.warn(
            `Operation ${operation.context.operation} failed (attempt ${attempt + 1}/${operation.maxRetries + 1}). ` +
              `Retrying in ${delay}ms. Error: ${error.message}`,
          );

          await this.sleep(delay);
        }
      }
    }

    // All retries failed, try fallback strategies
    if (fallbacks && fallbacks.length > 0) {
      console.error(`All retries failed for ${operation.context.operation}. Attempting fallback strategies.`);

      let fallbackSucceeded = false;
      for (const fallback of fallbacks) {
        try {
          const result = await fallback.execute();
          this.notifyAdminOfFallbackSuccess(operation.context, fallback.description);
          fallbackSucceeded = true;
          return result;
        } catch (fallbackError: any) {
          console.error(`Fallback strategy "${fallback.description}" failed:`, fallbackError.message);

          // For critical operations like rider assignment, send alert even if fallback fails
          if (operation.context.operation === 'rider_assignment') {
            await this.handleCriticalError(operation.context, fallbackError);
          }
        }
      }
    }

    // Everything failed - notify admin and throw
    this.handleCriticalError(operation.context, lastError);
    throw lastError;
  }

  /**
   * Handle critical errors that need immediate admin attention
   */
  static async handleCriticalError(context: ErrorContext, error: Error): Promise<void> {
    const isCritical = this.CRITICAL_OPERATIONS.includes(context.operation);

    const errorReport = {
      timestamp: new Date(),
      operation: context.operation,
      stage: context.stage,
      orderId: context.orderId,
      riderId: context.riderId,
      storeId: context.storeId,
      userId: context.userId,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      metadata: context.metadata,
      severity: isCritical ? 'critical' : 'high',
    };

    // Log error
    console.error('Critical error occurred:', errorReport);

    // Notify admin dashboard via WebSocket
    try {
      WebSocketService.getIO().to('admin:dashboard').emit('system:error', {
        type: 'critical_error',
        data: errorReport,
      });
    } catch (wsError) {
      console.error('Failed to notify admin via WebSocket:', wsError);
    }

    // For critical operations, also log to error tracking service and send email alerts
    if (isCritical) {
      this.logToCriticalErrorsStore(errorReport);

      // Send appropriate email alert based on operation type
      try {
        switch (context.operation) {
          case 'payment_settlement':
            await EmailService.sendCriticalPaymentAlert({
              orderId: context.orderId,
              operation: context.operation,
              error: error,
              severity: 'critical',
              metadata: context.metadata,
            });
            break;
          case 'rider_assignment':
            await EmailService.sendRiderAssignmentAlert({
              orderId: context.orderId,
              operation: context.operation,
              error: error,
              severity: 'critical',
              attempts: context.metadata?.attempts || 0,
              strategies: context.metadata?.strategies || [],
              metadata: context.metadata,
            });
            break;
          case 'order_status_transition':
          case 'try_period_finalization':
            await EmailService.sendOrderManagementAlert({
              orderId: context.orderId,
              operation: context.operation,
              error: error,
              severity: 'critical',
              metadata: context.metadata,
            });
            break;
          default:
            await EmailService.sendCriticalSystemAlert({
              orderId: context.orderId,
              operation: context.operation,
              error: error,
              severity: 'critical',
              metadata: context.metadata,
            });
        }
      } catch (emailError) {
        console.error('Failed to send critical error email alert:', emailError);
      }
    }
  }

  /**
   * Handle order-related errors with specific recovery strategies
   */
  static async handleOrderError(
    orderId: string,
    operation: string,
    error: Error,
    recoveryStrategies?: Array<() => Promise<any>>,
  ): Promise<void> {
    const context: ErrorContext = {
      orderId,
      operation,
      stage: 'order_processing',
      originalError: error,
    };

    // Try recovery strategies
    if (recoveryStrategies) {
      for (const strategy of recoveryStrategies) {
        try {
          await strategy();
          console.log(`Order ${orderId} recovered using strategy for ${operation}`);
          return;
        } catch (recoveryError) {
          console.warn(`Recovery strategy failed for order ${orderId}:`, recoveryError);
        }
      }
    }

    // If no recovery possible, handle as critical error and send email alert
    this.handleCriticalError(context, error);

    // Also send direct order management email alert
    try {
      await EmailService.sendOrderManagementAlert({
        orderId,
        operation,
        error: error,
        severity: 'critical',
        metadata: {
          recoveryAttempted: !!recoveryStrategies,
          recoveryCount: recoveryStrategies?.length || 0,
        },
      });
    } catch (emailError) {
      console.error('Failed to send order error email alert:', emailError);
    }
  }

  /**
   * Handle rider assignment failures with fallback strategies
   */
  static async handleRiderAssignmentError(orderId: string, error: Error): Promise<void> {
    const context: ErrorContext = {
      orderId,
      operation: 'rider_assignment',
      stage: 'sequential_offering',
      originalError: error,
    };

    const fallbackStrategies: FallbackStrategy[] = [
      {
        description: 'Expand search radius for riders',
        execute: async () => {
          // This would be implemented to retry with larger radius
          throw new Error('Fallback not implemented yet');
        },
      },
      {
        description: 'Notify customer of delay and manual assignment',
        execute: async () => {
          // This would notify customer and flag for manual assignment
          throw new Error('Fallback not implemented yet');
        },
      },
    ];

    // Handle as critical error - this will send email alert
    await this.handleCriticalError(context, error);
  }

  /**
   * Handle payment settlement failures
   */
  static async handlePaymentSettlementError(orderId: string, settlementType: string, error: Error): Promise<void> {
    const context: ErrorContext = {
      orderId,
      operation: 'payment_settlement',
      stage: settlementType,
      originalError: error,
      metadata: { settlementType },
    };

    // Payment errors are always critical
    this.handleCriticalError(context, error);

    // Also flag order for manual review
    try {
      // This would flag the order in database for manual payment review
      console.log(`Order ${orderId} flagged for manual payment review due to settlement error`);
    } catch (flagError) {
      console.error('Failed to flag order for manual review:', flagError);
    }
  }

  /**
   * Handle WebSocket connection failures
   */
  static handleWebSocketError(operation: string, targetId: string, error: Error): void {
    const context: ErrorContext = {
      operation: 'websocket_notification',
      stage: operation,
      originalError: error,
      metadata: { targetId },
    };

    // WebSocket failures are usually non-critical but should be monitored
    console.warn(`WebSocket notification failed for ${operation} to ${targetId}:`, error.message);

    // Light notification to admin (don't overwhelm)
    try {
      WebSocketService.getIO()
        .to('admin:dashboard')
        .emit('system:warning', {
          type: 'websocket_failure',
          data: {
            operation,
            targetId,
            error: error.message,
            timestamp: new Date(),
          },
        });
    } catch (wsError) {
      // If WebSocket to admin also fails, just log
      console.error('Failed to notify admin of WebSocket error:', wsError);
    }
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<any> {
    return {
      timestamp: new Date(),
      status: 'operational', // This would be calculated based on recent errors
      services: {
        websocket: 'operational',
        database: 'operational',
        payment_gateway: 'operational',
        rider_assignment: 'operational',
      },
      recentErrors: [], // This would pull from error store
      metrics: {
        totalOrders: 0, // These would be calculated
        activeDeliveries: 0,
        connectedRiders: 0,
        systemUptime: process.uptime(),
      },
    };
  }

  // Helper methods
  private static calculateDelay(baseDelay: number, attempt: number, useBackoff: boolean): number {
    if (!useBackoff) return baseDelay;

    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    return Math.min(exponentialDelay, this.MAX_RETRY_DELAY);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static notifyAdminOfRecovery(context: ErrorContext, attempts: number): void {
    try {
      WebSocketService.getIO()
        .to('admin:dashboard')
        .emit('system:recovery', {
          type: 'operation_recovered',
          data: {
            operation: context.operation,
            orderId: context.orderId,
            attempts,
            timestamp: new Date(),
          },
        });
    } catch (error) {
      console.error('Failed to notify admin of recovery:', error);
    }
  }

  private static notifyAdminOfFallbackSuccess(context: ErrorContext, strategy: string): void {
    try {
      WebSocketService.getIO()
        .to('admin:dashboard')
        .emit('system:fallback', {
          type: 'fallback_executed',
          data: {
            operation: context.operation,
            strategy,
            orderId: context.orderId,
            timestamp: new Date(),
          },
        });
    } catch (error) {
      console.error('Failed to notify admin of fallback success:', error);
    }
  }

  private static logToCriticalErrorsStore(errorReport: any): void {
    // This would save to a dedicated error collection/file for persistence
    console.error('CRITICAL ERROR LOGGED:', JSON.stringify(errorReport, null, 2));
  }
}
