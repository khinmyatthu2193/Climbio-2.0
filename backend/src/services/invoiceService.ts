import crypto from 'node:crypto';
import { Prisma, type InvoiceStatus, type OrderType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { canTransition } from '../utils/invoiceStatus.js';

export interface CreateInvoiceInput {
  customerName: string;
  customerPhone?: string | null;
  discount: number;
  orderType: OrderType;
  items: Array<{ productId: string; quantity: number }>;
}

const detailInclude = {
  items: { orderBy: { productName: 'asc' as const } },
} as const;

function invoiceNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `INV-${timestamp}-${suffix}`;
}

export const invoiceService = {
  async getPublic(id: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, user: { approvalStatus: 'APPROVED', accountStatus: 'ACTIVE' } },
      include: {
        ...detailInclude,
        user: {
          select: {
            shopName: true,
            shopLogo: true,
            shopAddress: true,
            phone: true,
            setting: { select: { currency: true, invoiceFooter: true } },
          },
        },
      },
    });
    if (!invoice) throw new AppError('Invoice not found', 404);
    const { user, userId: _userId, ...publicInvoice } = invoice;
    return { invoice: publicInvoice, shop: { ...user, currency: user.setting?.currency ?? 'MMK', invoiceFooter: user.setting?.invoiceFooter ?? null, setting: undefined } };
  },

  list(userId: string) {
    return prisma.invoice.findMany({
      where: { userId },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async get(userId: string, id: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: detailInclude,
    });
    if (!invoice) throw new AppError('Invoice not found', 404);
    return invoice;
  },

  create(userId: string, input: CreateInvoiceInput) {
    return prisma.$transaction(async (transaction) => {
      const productIds = input.items.map((item) => item.productId);
      const products = await transaction.product.findMany({
        where: { userId, id: { in: productIds } },
        select: { id: true, name: true, price: true },
      });
      if (products.length !== productIds.length) {
        throw new AppError('One or more selected products were not found', 404);
      }

      const productsById = new Map(products.map((product) => [product.id, product]));
      const subtotal = input.items.reduce((sum, item) => {
        const product = productsById.get(item.productId)!;
        return sum.plus(product.price.mul(item.quantity));
      }, new Prisma.Decimal(0));
      const discount = new Prisma.Decimal(input.discount);
      if (discount.greaterThan(subtotal)) {
        throw new AppError('Discount cannot exceed the subtotal', 422);
      }

      for (const item of input.items) {
        const stockUpdate = await transaction.product.updateMany({
          where: { id: item.productId, userId, quantity: { gte: item.quantity } },
          data: { quantity: { decrement: item.quantity } },
        });
        if (!stockUpdate.count) {
          throw new AppError(`${productsById.get(item.productId)!.name} does not have enough stock`, 409);
        }
      }

      return transaction.invoice.create({
        data: {
          userId,
          invoiceNumber: invoiceNumber(),
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          subtotal,
          discount,
          orderType: input.orderType,
          total: subtotal.minus(discount),
          items: {
            create: input.items.map((item) => {
              const product = productsById.get(item.productId)!;
              return {
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                price: product.price,
              };
            }),
          },
        },
        include: detailInclude,
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  },

  async updateStatus(userId: string, id: string, status: InvoiceStatus) {
    const invoice = await prisma.invoice.findFirst({ where: { id, userId }, select: { id: true, status: true, orderType: true } });
    if (!invoice) throw new AppError('Invoice not found', 404);
    if (!canTransition(invoice.status, status, invoice.orderType)) {
      throw new AppError(`Invoice cannot move from ${invoice.status} to ${status}`, 422);
    }
    return prisma.invoice.update({ where: { id }, data: { status }, include: detailInclude });
  },

  async remove(userId: string, id: string) {
    const invoice = await prisma.invoice.findFirst({ where: { id, userId }, select: { id: true } });
    if (!invoice) throw new AppError('Invoice not found', 404);
    await prisma.invoice.delete({ where: { id } });
  },
};
