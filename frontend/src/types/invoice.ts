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
  customerEmail?: string | null;
  shippingAddress?: string | null;
  deliveryFee?: string | number | null;
  notes?: string | null;
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

export interface PublicInvoiceResponse {
  invoice: Omit<Invoice, 'userId'>;
  shop: {
    shopName: string;
    shopLogo: string | null;
    shopAddress: string | null;
    phone: string | null;
    currency: 'MMK' | 'USD' | 'THB';
    invoiceFooter: string | null;
  };
}
