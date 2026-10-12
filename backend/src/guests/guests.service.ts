import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdDocumentType } from '@prisma/client';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async getAllGuests(hotelId: string, query?: string, page = 1, limit = 20) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { hotelId };

    if (query && query.trim()) {
      const q = query.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
        { idNumber: { contains: q } },
        { city: { contains: q, mode: 'insensitive' } },
        { stays: { some: { stayNumber: { contains: q, mode: 'insensitive' } } } },
        { stays: { some: { externalBookingRef: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const [guests, total] = await Promise.all([
      this.prisma.guest.findMany({
        where,
        include: {
          stays: {
            include: {
              room: true,
              bookingSource: true,
            },
            orderBy: { checkInTime: 'desc' },
            take: 1,
          },
          _count: {
            select: { stays: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.guest.count({ where }),
    ]);

    return {
      guests,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getGuestById(hotelId: string, id: string) {
    const guest = await this.prisma.guest.findFirst({
      where: { id, hotelId },
      include: {
        stays: {
          include: {
            room: { include: { roomType: true } },
            bookingSource: true,
            charges: {
              where: { isVoided: false },
              include: { category: true },
            },
            payments: {
              where: { status: 'SUCCESS' },
            },
            invoices: true,
            declarationAcceptances: {
              include: { declarationVersion: true },
            },
          },
          orderBy: { checkInTime: 'desc' },
        },
        documents: true,
      },
    });

    if (!guest) {
      throw new NotFoundException('Guest profile not found');
    }

    // Calculate lifetime metrics
    let totalLifetimeSpent = 0;
    let totalLifetimePaid = 0;

    for (const stay of guest.stays) {
      const stayChargesSum = stay.charges.reduce((acc, c) => acc + Number(c.totalAmount), 0);
      const stayPaymentsSum = stay.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      totalLifetimeSpent += stayChargesSum;
      totalLifetimePaid += stayPaymentsSum;
    }

    return {
      ...guest,
      analytics: {
        totalStays: guest.stays.length,
        totalLifetimeSpent,
        totalLifetimePaid,
        outstandingBalance: totalLifetimeSpent - totalLifetimePaid,
      },
    };
  }

  async checkDuplicate(hotelId: string, phone: string, email?: string) {
    const where: any = { hotelId };
    const conditions: any[] = [{ phone: phone.trim() }];

    if (email && email.trim()) {
      conditions.push({ email: email.trim().toLowerCase() });
    }

    where.OR = conditions;

    return this.prisma.guest.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        idType: true,
        idNumber: true,
        isVip: true,
      },
      take: 5,
    });
  }

  async createGuest(hotelId: string, data: any, userId: string) {
    if (!data.fullName || !data.phone || !data.idNumber) {
      throw new BadRequestException('Full name, phone, and government ID number are required.');
    }

    const guest = await this.prisma.guest.create({
      data: {
        hotelId,
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        email: data.email ? data.email.trim().toLowerCase() : null,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'India',
        nationality: data.nationality || 'Indian',
        idType: data.idType || IdDocumentType.AADHAAR,
        idNumber: data.idNumber.trim(),
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        isVip: !!data.isVip,
        notes: data.notes,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'CREATE_GUEST_PROFILE',
        entityType: 'GUEST',
        entityId: guest.id,
        details: { fullName: guest.fullName, phone: guest.phone },
      },
    });

    return guest;
  }

  async updateGuest(hotelId: string, id: string, data: any, userId: string) {
    const guest = await this.prisma.guest.findFirst({
      where: { id, hotelId },
    });

    if (!guest) {
      throw new NotFoundException('Guest profile not found');
    }

    const updated = await this.prisma.guest.update({
      where: { id },
      data: {
        fullName: data.fullName?.trim() || guest.fullName,
        phone: data.phone?.trim() || guest.phone,
        email: data.email !== undefined ? (data.email ? data.email.trim().toLowerCase() : null) : guest.email,
        address: data.address !== undefined ? data.address : guest.address,
        city: data.city !== undefined ? data.city : guest.city,
        state: data.state !== undefined ? data.state : guest.state,
        postalCode: data.postalCode !== undefined ? data.postalCode : guest.postalCode,
        country: data.country !== undefined ? data.country : guest.country,
        nationality: data.nationality !== undefined ? data.nationality : guest.nationality,
        idType: data.idType || guest.idType,
        idNumber: data.idNumber?.trim() || guest.idNumber,
        emergencyContactName: data.emergencyContactName !== undefined ? data.emergencyContactName : guest.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone !== undefined ? data.emergencyContactPhone : guest.emergencyContactPhone,
        isVip: data.isVip !== undefined ? Boolean(data.isVip) : guest.isVip,
        notes: data.notes !== undefined ? data.notes : guest.notes,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'UPDATE_GUEST_PROFILE',
        entityType: 'GUEST',
        entityId: id,
        details: { before: guest, after: updated },
      },
    });

    return updated;
  }
}
