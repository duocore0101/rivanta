import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, MaintenanceStatus, RoomStatus } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async getIssues(hotelId: string, status?: string) {
    const where: any = { hotelId };
    if (status && status !== 'ALL') {
      where.status = status as TaskStatus;
    }

    return this.prisma.maintenanceIssue.findMany({
      where,
      include: {
        room: { include: { roomType: true } },
        reportedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ priority: 'desc' }, { reportedAt: 'desc' }],
    });
  }

  async reportIssue(hotelId: string, data: any, userId: string) {
    const issue = await this.prisma.maintenanceIssue.create({
      data: {
        hotelId,
        roomId: data.roomId,
        reportedByUserId: userId,
        title: data.title,
        description: data.description,
        priority: data.priority || 'NORMAL',
        status: TaskStatus.PENDING,
      },
      include: { room: true },
    });

    // Mark room under maintenance
    await this.prisma.room.update({
      where: { id: data.roomId },
      data: {
        maintenanceStatus: MaintenanceStatus.UNDER_MAINTENANCE,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'REPORT_MAINTENANCE_ISSUE',
        entityType: 'MAINTENANCE_ISSUE',
        entityId: issue.id,
        details: { roomNumber: issue.room.roomNumber, title: issue.title },
      },
    });

    return issue;
  }

  async updateIssueStatus(hotelId: string, id: string, status: TaskStatus, resolutionNotes: string, userId: string) {
    const issue = await this.prisma.maintenanceIssue.findFirst({
      where: { id, hotelId },
      include: { room: true },
    });

    if (!issue) {
      throw new NotFoundException('Maintenance issue not found.');
    }

    const data: any = { status };
    if (resolutionNotes) data.resolutionNotes = resolutionNotes;
    if (status === TaskStatus.COMPLETED) {
      data.resolvedAt = new Date();
    }

    const updated = await this.prisma.maintenanceIssue.update({
      where: { id },
      data,
    });

    // If resolved, return room to operational
    if (status === TaskStatus.COMPLETED) {
      await this.prisma.room.update({
        where: { id: issue.roomId },
        data: {
          maintenanceStatus: MaintenanceStatus.OPERATIONAL,
        },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'UPDATE_MAINTENANCE_ISSUE',
        entityType: 'MAINTENANCE_ISSUE',
        entityId: id,
        details: { status, resolutionNotes },
      },
    });

    return updated;
  }
}
