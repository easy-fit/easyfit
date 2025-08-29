import { OrderItemModel } from '../models/orderItem.model';
import { AppError } from '../utils/appError';
import { CreateOrderItemDTO, UpdateOrderItemDTO } from '../types/orderItem.types';

export class OrderItemService {
  static async getOrderItems() {
    return OrderItemModel.find();
  }

  static async getOrderItemById(orderItemId: string) {
    const item = await OrderItemModel.findById(orderItemId);
    this.ensureOrderItemExists(item);
    return item;
  }

  static async getCompleteOrderData(orderId: string) {
    const orderItems = await OrderItemModel.find({ orderId })
      .populate({
        path: 'variantId',
        select: 'size color images price',
        populate: {
          path: 'productId',
          select: '_id title description category slug',
        },
      })
      .lean();

    if (orderItems.length === 0) {
      throw new AppError('No items found for this order', 404);
    }

    return orderItems;
  }

  static async createOrderItem(data: CreateOrderItemDTO) {
    return OrderItemModel.create(data);
  }

  static async createManyOrderItems(orderId: string, items: any[]) {
    // Create individual OrderItems for each physical item (split quantities)
    const orderItemData: any[] = [];
    
    items.forEach((item) => {
      // Create one OrderItem per physical item
      for (let i = 0; i < item.quantity; i++) {
        orderItemData.push({
          orderId: orderId,
          variantId: item.variantId,
          unitPrice: item.unit_price,
          quantity: 1, // Each OrderItem represents one physical item
          returnStatus: 'undecided' as const,
        });
      }
    });
    
    await OrderItemModel.insertMany(orderItemData);
  }

  static async updateOrderItem(orderItemId: string, data: UpdateOrderItemDTO) {
    const item = await OrderItemModel.findByIdAndUpdate(orderItemId, data, {
      new: true,
    });
    this.ensureOrderItemExists(item);

    return item;
  }

  static async updateReturnStatusAfterInspection(
    orderId: string, 
    inspectionResults: {
      returnStatus: 'returned_ok' | 'returned_partial' | 'returned_damaged';
      damagedItems?: Array<{
        variantId: string;
        reason: string;
      }>;
    }
  ) {
    console.log(`Starting inspection status update for order ${orderId}`);
    console.log(`Inspection results:`, inspectionResults);
    
    const orderItems = await this.getOrderItemsByOrderId(orderId);
    const returnedItems = orderItems.filter((item) => item.returnStatus === 'returned');

    console.log(`Found ${returnedItems.length} returned items to potentially update`);

    if (returnedItems.length === 0) {
      throw new AppError('No returned items found to update', 400);
    }

    const updateOperations = [];
    let damagedCount = 0;
    let goodCount = 0;

    if (inspectionResults.returnStatus === 'returned_damaged' && inspectionResults.damagedItems) {
      // Update damaged items to 'returned_damaged'
      const damagedVariantIds = inspectionResults.damagedItems.map(item => item.variantId);
      console.log(`Damaged variant IDs from inspection:`, damagedVariantIds);
      
      for (const item of returnedItems) {
        const itemVariantId = item.variantId._id?.toString() || item.variantId.toString();
        const isDamaged = damagedVariantIds.includes(itemVariantId);
        const newStatus = isDamaged ? 'returned_damaged' : 'returned';
        
        console.log(`Item ${item._id} (variant: ${itemVariantId}) -> ${newStatus} (damaged: ${isDamaged})`);
        
        if (isDamaged) {
          damagedCount++;
        } else {
          goodCount++;
        }
        
        updateOperations.push(
          OrderItemModel.findByIdAndUpdate(
            item._id,
            { returnStatus: newStatus },
            { new: true }
          )
        );
      }
    } else if (inspectionResults.returnStatus === 'returned_partial') {
      // Handle partial returns - some damaged, some good
      if (inspectionResults.damagedItems && inspectionResults.damagedItems.length > 0) {
        const damagedVariantIds = inspectionResults.damagedItems.map(item => item.variantId);
        console.log(`Partial return - damaged variant IDs:`, damagedVariantIds);
        
        for (const item of returnedItems) {
          const itemVariantId = item.variantId._id?.toString() || item.variantId.toString();
          const isDamaged = damagedVariantIds.includes(itemVariantId);
          const newStatus = isDamaged ? 'returned_damaged' : 'returned';
          
          console.log(`Item ${item._id} (variant: ${itemVariantId}) -> ${newStatus} (damaged: ${isDamaged})`);
          
          if (isDamaged) {
            damagedCount++;
          } else {
            goodCount++;
          }
          
          updateOperations.push(
            OrderItemModel.findByIdAndUpdate(
              item._id,
              { returnStatus: newStatus },
              { new: true }
            )
          );
        }
      } else {
        // No damaged items specified, keep all as 'returned'
        goodCount = returnedItems.length;
        console.log(`Partial return with no damage specified - keeping all ${goodCount} items as 'returned'`);
      }
    } else {
      // For returned_ok (no damage), keep all as 'returned'
      goodCount = returnedItems.length;
      console.log(`No damage reported - keeping all ${goodCount} items as 'returned'`);
    }

    if (updateOperations.length > 0) {
      console.log(`Executing ${updateOperations.length} status update operations`);
      await Promise.all(updateOperations);
    }

    console.log(`Inspection update completed: ${damagedCount} damaged, ${goodCount} good returned items`);
    return this.getOrderItemsByOrderId(orderId);
  }

  static async deleteOrderItem(orderItemId: string) {
    const item = await OrderItemModel.findByIdAndDelete(orderItemId);
    this.ensureOrderItemExists(item);
  }

  static async getOrderItemsByOrderId(orderId: string) {
    const items = await OrderItemModel.find({ orderId })
      .populate({
        path: 'variantId',
        select: 'size color images price',
        populate: {
          path: 'productId',
          select: '_id title description category slug',
        },
      });
    if (items.length === 0) {
      throw new AppError('No items found for this order', 404);
    }
    return items;
  }

  private static ensureOrderItemExists(item: any): void {
    if (!item) {
      throw new AppError('Order item not found', 404);
    }
  }
}
