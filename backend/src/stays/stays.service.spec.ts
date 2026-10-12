import { Test, TestingModule } from '@nestjs/testing';
import { StaysService } from './stays.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('StaysService Unit Tests', () => {
  let service: StaysService;

  const mockPrismaService = {
    stay: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    room: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaysService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StaysService>(StaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if checkout date is before checkin date in checkIn', async () => {
    await expect(
      service.checkIn('hotel-1', {
        stayData: {
          roomId: 'room-1',
          checkInTime: '2026-10-15',
          expectedCheckOutTime: '2026-10-10',
        },
      }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should properly calculate outstanding balance from charges and payments', async () => {
    mockPrismaService.stay.findFirst.mockResolvedValue({
      id: 'stay-1',
      hotelId: 'hotel-1',
      charges: [
        { isVoided: false, quantity: 2, unitPrice: 5000, discountAmount: 0, taxAmount: 1200, totalAmount: 11200 },
        { isVoided: false, quantity: 1, unitPrice: 800, discountAmount: 0, taxAmount: 40, totalAmount: 840 },
        { isVoided: true, quantity: 1, unitPrice: 500, discountAmount: 0, taxAmount: 0, totalAmount: 500 }, // should be ignored
      ],
      payments: [
        { status: 'SUCCESS', amount: 6000 },
      ],
      refunds: [],
      invoices: [],
      declarationAcceptances: [],
    });

    const result = await service.getStayById('hotel-1', 'stay-1');
    expect(result.folio.totalCharges).toBe(12040); // 11200 + 840
    expect(result.folio.totalPayments).toBe(6000);
    expect(result.folio.outstandingBalance).toBe(6040); // 12040 - 6000
  });
});
