export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

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
  createdAt: string;
  items?: InvoiceItem[];
  _count?: { items: number };
}

export interface CreateInvoiceInput {
  customerName: string;
  customerPhone: string;
  discount: number;
  items: Array<{ productId: string; quantity: number }>;
}
