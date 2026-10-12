import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRoleType } from '@prisma/client';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async getAllStaff(hotelId: string) {
    return this.prisma.user.findMany({
      where: { hotelId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaff(hotelId: string, data: any, userId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException(`User with email ${data.email} already exists.`);
    }

    const passwordHash = await bcrypt.hash(data.password || 'Rivanta@123', 10);

    const user = await this.prisma.user.create({
      data: {
        hotelId,
        email: data.email.toLowerCase().trim(),
        passwordHash,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone || null,
        role: data.role || UserRoleType.RECEPTIONIST,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'CREATE_STAFF_USER',
        entityType: 'USER',
        entityId: user.id,
        details: { email: user.email, role: user.role },
      },
    });

    return user;
  }

  async toggleStaffStatus(hotelId: string, id: string, isActive: boolean, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, hotelId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, email: true, isActive: true },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'TOGGLE_STAFF_ACTIVE_STATUS',
        entityType: 'USER',
        entityId: id,
        details: { email: user.email, isActive },
      },
    });

    return updated;
  }
}
