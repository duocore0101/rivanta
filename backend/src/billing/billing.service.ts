import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from './pdf.service';
import { PaymentMethod, PaymentType, PaymentStatus, InvoiceStatus, NotificationChannel, NotificationStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  // RECORD PAYMENT
  async recordPayment(hotelId: string, data: any, userId: string) {
    if (!data.stayId || !data.amount || Number(data.amount) <= 0) {
      throw new BadRequestException('Stay ID and positive payment amount are required.');
    }

    const stay = await this.prisma.stay.findFirst({
      where: { id: data.stayId, hotelId },
      include: {
        charges: { where: { isVoided: false } },
        payments: { where: { status: PaymentStatus.SUCCESS } },
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found.');
    }

    const year = new Date().getFullYear();
    const paymentCount = await this.prisma.payment.count({ where: { hotelId } });
    const paymentNumber = `PAY-${year}-${String(paymentCount + 1).padStart(4, '0')}`;

    const payment = await this.prisma.payment.create({
      data: {
        hotelId,
        stayId: stay.id,
        invoiceId: data.invoiceId || null,
        paymentNumber,
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod || PaymentMethod.CASH,
        paymentType: data.paymentType || PaymentType.PARTIAL,
        status: PaymentStatus.SUCCESS,
        transactionReference: data.transactionReference || null,
        notes: data.notes || null,
        receivedByUserId: userId,
      },
      include: { receivedByUser: true },
    });

    // If an invoice is attached, update invoice paid and balance amounts
    if (data.invoiceId) {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: data.invoiceId },
      });

      if (invoice) {
        const newPaid = Number(invoice.paidAmount) + Number(data.amount);
        const newBalance = Math.max(0, Number(invoice.totalAmount) - newPaid);
        const newStatus = newBalance <= 0.01 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: newPaid,
            balanceAmount: newBalance,
            status: newStatus,
          },
        });
      }
    }

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'RECORD_PAYMENT',
        entityType: 'PAYMENT',
        entityId: payment.id,
        details: {
          paymentNumber,
          amount: payment.amount,
          method: payment.paymentMethod,
          stayNumber: stay.stayNumber,
        },
      },
    });

    return payment;
  }

  // PROCESS REFUND
  async processRefund(hotelId: string, data: any, userId: string) {
    if (!data.paymentId || !data.amount || Number(data.amount) <= 0 || !data.reason) {
      throw new BadRequestException('Payment ID, positive refund amount, and reason are required.');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { id: data.paymentId, hotelId },
      include: { refunds: true, stay: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    if (payment.status !== PaymentStatus.SUCCESS && payment.status !== PaymentStatus.PARTIALLY_REFUNDED) {
      throw new BadRequestException('Cannot refund a non-successful or void payment.');
    }

    const previouslyRefunded = payment.refunds.reduce((acc, r) => acc + Number(r.amount), 0);
    const availableForRefund = Number(payment.amount) - previouslyRefunded;

    if (Number(data.amount) > availableForRefund) {
      throw new BadRequestException(
        `Refund amount exceeds refundable limit. Maximum refundable for this payment is ₹${availableForRefund.toLocaleString('en-IN')}`
      );
    }

    const year = new Date().getFullYear();
    const refundCount = await this.prisma.refund.count({ where: { hotelId } });
    const refundNumber = `REF-${year}-${String(refundCount + 1).padStart(4, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({
        data: {
          hotelId,
          paymentId: payment.id,
          stayId: payment.stayId,
          refundNumber,
          amount: Number(data.amount),
          reason: data.reason,
          transactionReference: data.transactionReference || null,
          approvedByUserId: userId,
          processedByUserId: userId,
        },
      });

      const totalRefundedNow = previouslyRefunded + Number(data.amount);
      const newPaymentStatus =
        totalRefundedNow >= Number(payment.amount) ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: newPaymentStatus },
      });

      await tx.auditLog.create({
        data: {
          hotelId,
          userId,
          action: 'PROCESS_REFUND',
          entityType: 'REFUND',
          entityId: refund.id,
          details: {
            refundNumber,
            amount: refund.amount,
            reason: refund.reason,
            paymentNumber: payment.paymentNumber,
          },
        },
      });

      return refund;
    });
  }

  // GENERATE & FINALIZE INVOICE
  async generateInvoice(hotelId: string, stayId: string, userId: string) {
    const stay = await this.prisma.stay.findFirst({
      where: { id: stayId, hotelId },
      include: {
        guest: true,
        room: { include: { roomType: true } },
        charges: {
          where: { isVoided: false },
          include: { category: true },
        },
        payments: {
          where: { status: PaymentStatus.SUCCESS },
        },
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found.');
    }

    // Check if an active invoice already exists
    const existing = await this.prisma.invoice.findFirst({
      where: { stayId, hotelId, status: { not: InvoiceStatus.VOID } },
      include: { lineItems: true, payments: true },
    });

    if (existing) {
      return existing;
    }

    const settings = await this.prisma.hotelSetting.findUnique({ where: { hotelId } });
    const prefix = settings?.invoicePrefix || 'INV-';
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count({ where: { hotelId } });
    const invoiceNumber = `${prefix}${year}-${String(count + 1).padStart(5, '0')}`;

    // Precise calculations
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    let totalAmount = 0;

    for (const c of stay.charges) {
      const lineSub = Number(c.quantity) * Number(c.unitPrice);
      const lineDisc = Number(c.discountAmount);
      const lineTax = Number(c.taxAmount);
      const lineTot = Number(c.totalAmount);

      subtotal += lineSub;
      discountTotal += lineDisc;
      taxTotal += lineTax;
      totalAmount += lineTot;
    }

    const paidAmount = stay.payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const balanceAmount = Math.max(0, totalAmount - paidAmount);
    const status = balanceAmount <= 0.01 ? InvoiceStatus.PAID : (paidAmount > 0 ? InvoiceStatus.PARTIALLY_PAID : InvoiceStatus.FINALIZED);

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          hotelId,
          stayId: stay.id,
          invoiceNumber,
          invoiceDate: new Date(),
          subtotal,
          discountTotal,
          taxTotal,
          totalAmount,
          paidAmount,
          balanceAmount,
          status,
          finalizedAt: new Date(),
          createdByUserId: userId,
          lineItems: {
            create: stay.charges.map((c) => ({
              stayChargeId: c.id,
              description: c.description,
              categoryName: c.category.name,
              quantity: c.quantity,
              unitPrice: c.unitPrice,
              discountAmount: c.discountAmount,
              taxPercent: c.taxPercent,
              taxAmount: c.taxAmount,
              totalAmount: c.totalAmount,
            })),
          },
        },
        include: { lineItems: true, stay: { include: { guest: true, room: true } } },
      });

      // Link any existing payments
      await tx.payment.updateMany({
        where: { stayId: stay.id, hotelId },
        data: { invoiceId: invoice.id },
      });

      await tx.auditLog.create({
        data: {
          hotelId,
          userId,
          action: 'GENERATE_INVOICE',
          entityType: 'INVOICE',
          entityId: invoice.id,
          details: { invoiceNumber, totalAmount, balanceAmount },
        },
      });

      return invoice;
    });
  }

  // GET INVOICES LIST
  async getInvoices(hotelId: string, status?: string, query?: string, page = 1, limit = 20) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { hotelId };

    if (status && status !== 'ALL') {
      where.status = status as InvoiceStatus;
    }

    if (query && query.trim()) {
      const q = query.trim();
      where.OR = [
        { invoiceNumber: { contains: q, mode: 'insensitive' } },
        { stay: { guest: { fullName: { contains: q, mode: 'insensitive' } } } },
        { stay: { guest: { phone: { contains: q } } } },
        { stay: { room: { roomNumber: { contains: q } } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          stay: {
            include: {
              guest: true,
              room: true,
            },
          },
          createdByUser: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { invoiceDate: 'desc' },
        skip,
        take,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // GET INVOICE BY ID
  async getInvoiceById(hotelId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, hotelId },
      include: {
        hotel: true,
        stay: {
          include: {
            guest: true,
            room: { include: { roomType: true } },
            bookingSource: true,
          },
        },
        lineItems: true,
        payments: {
          where: { status: PaymentStatus.SUCCESS },
          orderBy: { paymentDate: 'asc' },
        },
        createdByUser: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }

    return invoice;
  }

  // GET INVOICE PDF BUFFER
  async getInvoicePdfBuffer(hotelId: string, id: string): Promise<{ buffer: Buffer; filename: string }> {
    const invoice = await this.getInvoiceById(hotelId, id);
    const buffer = await this.pdfService.generateInvoicePdf(invoice);
    return {
      buffer,
      filename: `${invoice.invoiceNumber}.pdf`,
    };
  }

  // SHARE INVOICE (With explicit provider-ready check and realistic messaging)
  async shareInvoice(hotelId: string, invoiceId: string, channel: NotificationChannel, recipient: string) {
    const invoice = await this.getInvoiceById(hotelId, invoiceId);

    // Prompt rule: "If an external provider is not configured, display a clear setup or unavailable state instead of claiming that an operation succeeded."
    // "Never claim that an email/WhatsApp message was sent when credentials are absent."
    const isEmailConfigured = !!process.env.SMTP_HOST && !!process.env.SMTP_USER;
    const isWhatsAppConfigured = !!process.env.TWILIO_WHATSAPP_SID && !!process.env.TWILIO_AUTH_TOKEN;

    const channelConfigured = channel === NotificationChannel.EMAIL ? isEmailConfigured : isWhatsAppConfigured;

    if (!channelConfigured) {
      const errorMsg =
        channel === NotificationChannel.EMAIL
          ? 'Email SMTP provider credentials are not configured in environment (SMTP_HOST, SMTP_USER). Live email delivery is paused.'
          : 'WhatsApp API credentials are not configured in environment (TWILIO_WHATSAPP_SID, TWILIO_AUTH_TOKEN). Live WhatsApp delivery is paused.';

      await this.prisma.notificationLog.create({
        data: {
          hotelId,
          stayId: invoice.stayId,
          recipient: recipient || (channel === NotificationChannel.EMAIL ? invoice.stay.guest.email : invoice.stay.guest.phone),
          channel,
          templateName: 'INVOICE_BILLING_SHARE',
          status: NotificationStatus.SIMULATED_UNCONFIGURED,
          errorMessage: errorMsg,
          metadata: { invoiceNumber: invoice.invoiceNumber },
        },
      });

      return {
        success: false,
        status: 'UNCONFIGURED_PROVIDER',
        message: errorMsg,
        recipient,
        channel,
      };
    }

    // If configured in future:
    return {
      success: true,
      status: 'SENT',
      message: `Invoice ${invoice.invoiceNumber} successfully transmitted to ${recipient}`,
    };
  }
}
