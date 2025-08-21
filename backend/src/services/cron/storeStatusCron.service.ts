import * as cron from 'node-cron';
import { StoreModel } from '../../models/store.model';
import { calculateStoreOpenStatus, getTimestamp } from '../../utils/timeUtils';

export class StoreStatusCronService {
  private static cronJob: cron.ScheduledTask | null = null;
  private static isRunning = false;

  /**
   * Start the cron job to automatically update store statuses
   */
  public static start(): void {
    if (this.cronJob) {
      console.log(`[${getTimestamp()}] Store status cron job is already running`);
      return;
    }

    // Run every 5 minutes: */5 * * * *
    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      await this.updateAllStoreStatuses();
    });

    // Job is created and started automatically
    console.log(`[${getTimestamp()}] Store status cron job started - running every 5 minutes`);
  }

  /**
   * Stop the cron job
   */
  public static stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log(`[${getTimestamp()}] Store status cron job stopped`);
    }
  }

  /**
   * Main function to update all store statuses
   */
  private static async updateAllStoreStatuses(): Promise<void> {
    // Prevent multiple simultaneous executions
    if (this.isRunning) {
      console.log(`[${getTimestamp()}] Store status cron job already running, skipping this execution`);
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      // Get all active stores
      const activeStores = await StoreModel.find({ 
        status: 'active' 
      }).select('_id name pickupHours isOpen');

      console.log(`[${getTimestamp()}] Processing ${activeStores.length} active stores`);

      let updatedCount = 0;
      const errors: any[] = [];

      // Process each store
      for (const store of activeStores) {
        try {
          const shouldBeOpen = calculateStoreOpenStatus(store.pickupHours);
          
          // Only update if status changed
          if (store.isOpen !== shouldBeOpen) {
            await StoreModel.findByIdAndUpdate(
              store._id, 
              { isOpen: shouldBeOpen },
              { new: false } // Don't return the updated document to save memory
            );

            updatedCount++;
            console.log(`[${getTimestamp()}] Updated store "${store.name}" (${store._id}): isOpen changed from ${store.isOpen} to ${shouldBeOpen}`);
          }
        } catch (error) {
          const errorInfo = {
            storeId: store._id,
            storeName: store.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          errors.push(errorInfo);
          console.error(`[${getTimestamp()}] Error updating store "${store.name}" (${store._id}):`, error);
        }
      }

      const executionTime = Date.now() - startTime;
      console.log(`[${getTimestamp()}] Store status cron completed: ${updatedCount} stores updated, ${errors.length} errors, ${executionTime}ms`);

      // Log errors if any
      if (errors.length > 0) {
        console.error(`[${getTimestamp()}] Store status cron errors:`, errors);
      }

    } catch (error) {
      console.error(`[${getTimestamp()}] Critical error in store status cron:`, error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run the status update immediately (for testing or manual trigger)
   */
  public static async runNow(): Promise<void> {
    console.log(`[${getTimestamp()}] Running store status update manually`);
    await this.updateAllStoreStatuses();
  }

  /**
   * Get the status of the cron job
   */
  public static getStatus(): { isActive: boolean; isRunning: boolean } {
    return {
      isActive: this.cronJob !== null,
      isRunning: this.isRunning
    };
  }
}