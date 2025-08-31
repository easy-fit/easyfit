import type { CompleteOrder, ItemDecision } from '@/types/order';

// Check if all decisions are made for order items
export const allDecisionsMade = (orderItems: CompleteOrder['orderItems'], decisions: Record<string, 'keep' | 'return'>): boolean => {
  return orderItems.every((item) => decisions[item._id]);
};

// Count decisions by type
export const getDecisionCounts = (decisions: Record<string, 'keep' | 'return'>) => {
  const decisionCount = Object.keys(decisions).length;
  const keepCount = Object.values(decisions).filter((d) => d === 'keep').length;
  const returnCount = Object.values(decisions).filter((d) => d === 'return').length;
  
  return { decisionCount, keepCount, returnCount };
};

// Create bulk decision records for order items
export const createBulkDecisions = (orderItems: CompleteOrder['orderItems'], decision: 'keep' | 'return'): Record<string, 'keep' | 'return'> => {
  const newDecisions: Record<string, 'keep' | 'return'> = {};
  orderItems.forEach((item) => {
    newDecisions[item._id] = decision;
  });
  return newDecisions;
};

// Transform decisions to API format
export const transformDecisionsForAPI = (orderItems: CompleteOrder['orderItems'], decisions: Record<string, 'keep' | 'return'>): ItemDecision[] => {
  return orderItems.map((item) => ({
    variantId: item.variantId._id,
    orderItemId: item._id, // Include OrderItem ID for individual targeting
    decision: decisions[item._id],
  }));
};