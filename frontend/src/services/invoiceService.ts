import { api } from './api';
import type { CreateInvoiceInput, Invoice, InvoiceStatus, PublicInvoiceResponse } from '@/types/invoice';

export const invoiceService = {
  list: () => api.get<Invoice[]>('/invoices').then((response) => response.data),
  get: (id: string) => api.get<Invoice>(`/invoices/${id}`).then((response) => response.data),
  getPublic: (id: string) => api.get<PublicInvoiceResponse>(`/invoices/public/${id}`).then((response) => response.data),
  create: (input: CreateInvoiceInput) =>
    api.post<Invoice>('/invoices', input).then((response) => response.data),
  updateStatus: (id: string, status: InvoiceStatus) =>
    api.put<Invoice>(`/invoices/${id}/status`, { status }).then((response) => response.data),
  remove: (id: string) => api.delete(`/invoices/${id}`),
};
