import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PdfService } from './pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('BillingService Unit Tests', () => {
  let service: BillingService;

  const mockPrismaService = {
    payment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    stay: {
      findFirst: jest.fn(),
    },
    invoice: {
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockPdfService = {
    generateInvoicePdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PdfService,
          useValue: mockPdfService,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if refund amount exceeds available refundable amount', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue({
      id: 'pay-1',
      hotelId: 'hotel-1',
      stayId: 'stay-1',
      amount: 5000,
      status: 'SUCCESS',
      refunds: [{ amount: 3000 }], // 2000 remaining
    });

    await expect(
      service.processRefund('hotel-1', { paymentId: 'pay-1', amount: 2500, reason: 'Guest checkout dispute' }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if payment amount is zero or negative', async () => {
    await expect(
      service.recordPayment('hotel-1', { stayId: 'stay-1', amount: -500 }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });
});
