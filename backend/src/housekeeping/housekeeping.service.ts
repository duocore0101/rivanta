import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, HousekeepingStatus, RoomStatus } from '@prisma/client';

@Injectable()
export class HousekeepingService {
  constructor(private prisma: PrismaService) {}

  async getTasks(hotelId: string, status?: string) {
    const where: any = { hotelId };
    if (status && status !== 'ALL') {
      where.status = status as TaskStatus;
    }

    return this.prisma.housekeepingTask.findMany({
      where,
      include: {
        room: { include: { roomType: true } },
        assignedToUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createTask(hotelId: string, data: any, userId: string) {
    const task = await this.prisma.housekeepingTask.create({
      data: {
        hotelId,
        roomId: data.roomId,
        stayId: data.stayId || null,
        taskType: data.taskType || 'TURNOVER',
        status: TaskStatus.PENDING,
        priority: data.priority || 'NORMAL',
        notes: data.notes || null,
        assignedToUserId: data.assignedToUserId || null,
      },
      include: { room: true },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'CREATE_HOUSEKEEPING_TASK',
        entityType: 'HOUSEKEEPING_TASK',
        entityId: task.id,
        details: { roomNumber: task.room.roomNumber, taskType: task.taskType },
      },
    });

    return task;
  }

  async updateTaskStatus(hotelId: string, id: string, status: TaskStatus, userId: string) {
    const task = await this.prisma.housekeepingTask.findFirst({
      where: { id, hotelId },
      include: { room: true },
    });

    if (!task) {
      throw new NotFoundException('Housekeeping task not found.');
    }

    const data: any = { status };
    if (status === TaskStatus.IN_PROGRESS && !task.startedAt) {
      data.startedAt = new Date();
    } else if (status === TaskStatus.COMPLETED) {
      data.completedAt = new Date();
    }

    const updated = await this.prisma.housekeepingTask.update({
      where: { id },
      data,
    });

    // If completed, update room housekeepingStatus to CLEAN and available if not occupied
    if (status === TaskStatus.COMPLETED) {
      await this.prisma.room.update({
        where: { id: task.roomId },
        data: {
          housekeepingStatus: HousekeepingStatus.CLEAN,
          status: task.room.status === RoomStatus.OCCUPIED ? RoomStatus.OCCUPIED : RoomStatus.AVAILABLE,
        },
      });
    } else if (status === TaskStatus.IN_PROGRESS) {
      await this.prisma.room.update({
        where: { id: task.roomId },
        data: {
          housekeepingStatus: HousekeepingStatus.CLEANING_IN_PROGRESS,
        },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'UPDATE_HOUSEKEEPING_TASK',
        entityType: 'HOUSEKEEPING_TASK',
        entityId: id,
        details: { roomNumber: task.room.roomNumber, oldStatus: task.status, newStatus: status },
      },
    });

    return updated;
  }
}
