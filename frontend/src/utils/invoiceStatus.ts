import type { InvoiceStatus, OrderType } from '@/types/invoice';

export const invoiceWorkflows: Record<OrderType, readonly InvoiceStatus[]> = {
  DELIVERY: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'PAID'],
  PICKUP: ['PENDING', 'READY_FOR_PICKUP', 'PICKED_UP', 'PAID'],
};

export const allInvoiceStatuses: readonly InvoiceStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'READY_FOR_PICKUP', 'PICKED_UP', 'PAID', 'CANCELLED'];

export function canTransition(from: InvoiceStatus, to: InvoiceStatus, orderType: OrderType): boolean {
  if (to === 'CANCELLED') return from !== 'CANCELLED';
  const workflow = invoiceWorkflows[orderType];
  const currentIndex = workflow.indexOf(from);
  return currentIndex >= 0 && workflow[currentIndex + 1] === to;
}

export function immediateNextStatus(status: InvoiceStatus, orderType: OrderType): InvoiceStatus | undefined {
  return invoiceWorkflows[orderType][invoiceWorkflows[orderType].indexOf(status) + 1];
}
