import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async getBookingSources(hotelId: string) {
    return this.prisma.bookingSource.findMany({
      where: { hotelId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createBookingSource(hotelId: string, data: any) {
    const existing = await this.prisma.bookingSource.findUnique({
      where: { hotelId_code: { hotelId, code: data.code.toUpperCase().trim() } },
    });

    if (existing) {
      throw new ConflictException(`Booking source code ${data.code} already exists.`);
    }

    return this.prisma.bookingSource.create({
      data: {
        hotelId,
        name: data.name,
        code: data.code.toUpperCase().trim(),
        commissionRate: Number(data.commissionRate) || 0,
        isDirect: !!data.isDirect,
      },
    });
  }

  async getCategories(hotelId: string) {
    return this.prisma.chargeCategory.findMany({
      where: { hotelId },
      include: {
        serviceItems: { where: { isActive: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getServiceItems(hotelId: string, categoryId?: string) {
    const where: any = { hotelId, isActive: true };
    if (categoryId) where.categoryId = categoryId;

    return this.prisma.serviceItem.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async createServiceItem(hotelId: string, data: any) {
    return this.prisma.serviceItem.create({
      data: {
        hotelId,
        categoryId: data.categoryId,
        name: data.name,
        sku: data.sku || null,
        unitPrice: Number(data.unitPrice),
        taxPercent: Number(data.taxPercent) || 0,
        isAlcohol: !!data.isAlcohol,
      },
      include: { category: true },
    });
  }
}
