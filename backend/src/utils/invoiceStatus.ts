import type { InvoiceStatus, OrderType } from '@prisma/client';

const workflows: Record<OrderType, readonly InvoiceStatus[]> = {
  DELIVERY: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'PAID'],
  PICKUP: ['PENDING', 'READY_FOR_PICKUP', 'PICKED_UP', 'PAID'],
};

export function canTransition(from: InvoiceStatus, to: InvoiceStatus, orderType: OrderType): boolean {
  if (from === 'PAID' || from === 'CANCELLED') return false;
  if (to === 'CANCELLED') return true;
  const workflow = workflows[orderType];
  const currentIndex = workflow.indexOf(from);
  return currentIndex >= 0 && workflow[currentIndex + 1] === to;
}
