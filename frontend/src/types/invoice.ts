export type InvoiceStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'PAID' | 'CANCELLED';
export type OrderType = 'DELIVERY' | 'PICKUP';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string | null;
  productName: string;
  quantity: number;
  price: string;
}

export interface Invoice {
  id: string;
  userId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string | null;
  subtotal: string;
  discount: string;
  total: string;
  status: InvoiceStatus;
  orderType: OrderType;
  createdAt: string;
  items?: InvoiceItem[];
  _count?: { items: number };
}

export interface CreateInvoiceInput {
  customerName: string;
  customerPhone: string;
  discount: number;
  orderType: OrderType;
  items: Array<{ productId: string; quantity: number }>;
}
