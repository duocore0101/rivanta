import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelService {
  constructor(private prisma: PrismaService) {}

  async getHotel(hotelId: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        hotelSettings: true,
        taxConfigurations: true,
        declarationVersions: {
          where: { isActive: true },
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    return hotel;
  }

  async updateHotel(hotelId: string, data: any, userId: string) {
    const updated = await this.prisma.hotel.update({
      where: { id: hotelId },
      data: {
        name: data.name,
        legalName: data.legalName,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        phone: data.phone,
        email: data.email,
        website: data.website,
        timezone: data.timezone,
        currency: data.currency,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'UPDATE_HOTEL_PROFILE',
        entityType: 'HOTEL',
        entityId: hotelId,
        details: data,
      },
    });

    return updated;
  }

  async getSettings(hotelId: string) {
    let settings = await this.prisma.hotelSetting.findUnique({
      where: { hotelId },
    });

    if (!settings) {
      settings = await this.prisma.hotelSetting.create({
        data: {
          hotelId,
          checkInTime: '14:00',
          checkOutTime: '11:00',
          defaultTaxRate: 12.0,
          currency: 'INR',
          currencySymbol: '₹',
        },
      });
    }

    const taxes = await this.prisma.taxConfiguration.findMany({
      where: { hotelId },
    });

    const activeDeclaration = await this.prisma.guestDeclarationVersion.findFirst({
      where: { hotelId, isActive: true },
      orderBy: { versionNumber: 'desc' },
    });

    return {
      settings,
      taxes,
      activeDeclaration,
    };
  }

  async updateSettings(hotelId: string, data: any, userId: string) {
    const updated = await this.prisma.hotelSetting.upsert({
      where: { hotelId },
      update: {
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        defaultTaxRate: data.defaultTaxRate,
        invoicePrefix: data.invoicePrefix,
        allowUnpaidCheckout: data.allowUnpaidCheckout,
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        timezone: data.timezone,
        emailNotificationsEnabled: data.emailNotificationsEnabled,
        whatsAppNotificationsEnabled: data.whatsAppNotificationsEnabled,
      },
      create: {
        hotelId,
        checkInTime: data.checkInTime || '14:00',
        checkOutTime: data.checkOutTime || '11:00',
        defaultTaxRate: data.defaultTaxRate || 12.0,
        invoicePrefix: data.invoicePrefix || 'INV-',
        allowUnpaidCheckout: !!data.allowUnpaidCheckout,
        currency: data.currency || 'INR',
        currencySymbol: data.currencySymbol || '₹',
        timezone: data.timezone || 'Asia/Kolkata',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'UPDATE_HOTEL_SETTINGS',
        entityType: 'HOTEL_SETTING',
        entityId: updated.id,
        details: data,
      },
    });

    return updated;
  }

  async updateDeclaration(hotelId: string, data: { title: string; content: string }, userId: string) {
    const latest = await this.prisma.guestDeclarationVersion.findFirst({
      where: { hotelId },
      orderBy: { versionNumber: 'desc' },
    });

    const nextVersion = (latest?.versionNumber || 0) + 1;

    // Set old versions to inactive
    await this.prisma.guestDeclarationVersion.updateMany({
      where: { hotelId },
      data: { isActive: false },
    });

    const created = await this.prisma.guestDeclarationVersion.create({
      data: {
        hotelId,
        versionNumber: nextVersion,
        title: data.title,
        content: data.content,
        isActive: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'UPDATE_DECLARATION_VERSION',
        entityType: 'GUEST_DECLARATION_VERSION',
        entityId: created.id,
        details: { versionNumber: nextVersion, title: data.title },
      },
    });

    return created;
  }
}
