export interface TryPeriodInfo {
  isActive: boolean;
  startedAt?: Date;
  endsAt?: Date;
  duration?: number; // seconds
  status: 'active' | 'expired' | 'finalized';
  exceededTime?: number; // seconds over limit
  finalizedAt?: Date;
}

export interface ItemDecision {
  variantId: string;
  orderItemId?: string; // For individual OrderItem targeting
  decision: 'keep' | 'return';
}

export interface TryPeriodUpdate {
  orderId: string;
  items: ItemDecision[];
  finalized?: boolean;
}
