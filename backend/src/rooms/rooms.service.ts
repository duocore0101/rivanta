import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomStatus, HousekeepingStatus, MaintenanceStatus, StayStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async getAllRooms(hotelId: string, status?: string, housekeepingStatus?: string, floor?: number) {
    const where: any = { hotelId };

    if (status && status !== 'ALL') {
      where.status = status as RoomStatus;
    }

    if (housekeepingStatus && housekeepingStatus !== 'ALL') {
      where.housekeepingStatus = housekeepingStatus as HousekeepingStatus;
    }

    if (floor) {
      where.floor = Number(floor);
    }

    return this.prisma.room.findMany({
      where,
      include: {
        roomType: true,
        stays: {
          where: { status: StayStatus.ACTIVE },
          include: {
            guest: true,
            bookingSource: true,
          },
          take: 1,
        },
        housekeepingTasks: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
          include: { assignedToUser: true },
          take: 1,
        },
        maintenanceIssues: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
          take: 1,
        },
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });
  }

  async getRoomById(hotelId: string, id: string) {
    const room = await this.prisma.room.findFirst({
      where: { id, hotelId },
      include: {
        roomType: true,
        stays: {
          where: { status: StayStatus.ACTIVE },
          include: {
            guest: true,
            charges: true,
            payments: true,
            declarationAcceptances: true,
          },
          take: 1,
        },
        housekeepingTasks: {
          include: { assignedToUser: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        maintenanceIssues: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async createRoom(hotelId: string, data: any, userId: string) {
    const existing = await this.prisma.room.findUnique({
      where: {
        hotelId_roomNumber: {
          hotelId,
          roomNumber: data.roomNumber.trim(),
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Room number ${data.roomNumber} already exists in this hotel.`);
    }

    const room = await this.prisma.room.create({
      data: {
        hotelId,
        roomNumber: data.roomNumber.trim(),
        floor: Number(data.floor) || 1,
        roomTypeId: data.roomTypeId,
        rateOverride: data.rateOverride ? Number(data.rateOverride) : null,
        status: data.status || RoomStatus.AVAILABLE,
        housekeepingStatus: data.housekeepingStatus || HousekeepingStatus.CLEAN,
        maintenanceStatus: data.maintenanceStatus || MaintenanceStatus.OPERATIONAL,
        notes: data.notes,
      },
      include: { roomType: true },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'CREATE_ROOM',
        entityType: 'ROOM',
        entityId: room.id,
        details: { roomNumber: room.roomNumber, floor: room.floor, roomTypeId: room.roomTypeId },
      },
    });

    return room;
  }

  async updateRoom(hotelId: string, id: string, data: any, userId: string) {
    const room = await this.prisma.room.findFirst({
      where: { id, hotelId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const updated = await this.prisma.room.update({
      where: { id },
      data: {
        roomTypeId: data.roomTypeId || room.roomTypeId,
        floor: data.floor !== undefined ? Number(data.floor) : room.floor,
        rateOverride: data.rateOverride !== undefined ? (data.rateOverride ? Number(data.rateOverride) : null) : room.rateOverride,
        status: data.status || room.status,
        housekeepingStatus: data.housekeepingStatus || room.housekeepingStatus,
        maintenanceStatus: data.maintenanceStatus || room.maintenanceStatus,
        notes: data.notes !== undefined ? data.notes : room.notes,
      },
      include: { roomType: true },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'UPDATE_ROOM',
        entityType: 'ROOM',
        entityId: id,
        details: { before: room, after: updated },
      },
    });

    return updated;
  }

  async updateHousekeeping(hotelId: string, id: string, housekeepingStatus: HousekeepingStatus, userId: string) {
    const room = await this.prisma.room.findFirst({
      where: { id, hotelId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Business rule: If room is OCCUPIED, it stays OCCUPIED even if housekeeping changes.
    // If room is CLEAN and not occupied and not in maintenance, status is AVAILABLE.
    let newRoomStatus = room.status;
    if (room.status !== RoomStatus.OCCUPIED && room.status !== RoomStatus.OUT_OF_SERVICE) {
      if (housekeepingStatus === HousekeepingStatus.CLEAN) {
        newRoomStatus = RoomStatus.AVAILABLE;
      }
    }

    const updated = await this.prisma.room.update({
      where: { id },
      data: {
        housekeepingStatus,
        status: newRoomStatus,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'UPDATE_HOUSEKEEPING_STATUS',
        entityType: 'ROOM',
        entityId: id,
        details: { roomNumber: room.roomNumber, oldStatus: room.housekeepingStatus, newStatus: housekeepingStatus },
      },
    });

    return updated;
  }

  // Room Types
  async getAllRoomTypes(hotelId: string) {
    return this.prisma.roomType.findMany({
      where: { hotelId, isActive: true },
      include: {
        _count: {
          select: { rooms: true },
        },
      },
      orderBy: { basePrice: 'asc' },
    });
  }

  async createRoomType(hotelId: string, data: any, userId: string) {
    const existing = await this.prisma.roomType.findUnique({
      where: {
        hotelId_code: {
          hotelId,
          code: data.code.toUpperCase().trim(),
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Room type code ${data.code} already exists.`);
    }

    const roomType = await this.prisma.roomType.create({
      data: {
        hotelId,
        name: data.name,
        code: data.code.toUpperCase().trim(),
        description: data.description,
        basePrice: Number(data.basePrice),
        maxOccupancy: Number(data.maxOccupancy) || 2,
        bedsCount: Number(data.bedsCount) || 1,
        sizeSqFt: data.sizeSqFt ? Number(data.sizeSqFt) : null,
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
      },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'CREATE_ROOM_TYPE',
        entityType: 'ROOM_TYPE',
        entityId: roomType.id,
        details: { name: roomType.name, code: roomType.code, basePrice: roomType.basePrice },
      },
    });

    return roomType;
  }

  async updateRoomType(hotelId: string, id: string, data: any, userId: string) {
    const updated = await this.prisma.roomType.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice !== undefined ? Number(data.basePrice) : undefined,
        maxOccupancy: data.maxOccupancy !== undefined ? Number(data.maxOccupancy) : undefined,
        bedsCount: data.bedsCount !== undefined ? Number(data.bedsCount) : undefined,
        sizeSqFt: data.sizeSqFt !== undefined ? Number(data.sizeSqFt) : undefined,
        amenities: Array.isArray(data.amenities) ? data.amenities : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'UPDATE_ROOM_TYPE',
        entityType: 'ROOM_TYPE',
        entityId: id,
        details: data,
      },
    });

    return updated;
  }

  // Check room availability for date range
  async checkAvailability(hotelId: string, checkIn: string, checkOut: string, roomTypeId?: string) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new BadRequestException('Valid checkIn and checkOut dates are required.');
    }

    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('Check-out date must be strictly after check-in date.');
    }

    // Find rooms that currently have an active overlapping stay
    const overlappingStays = await this.prisma.stay.findMany({
      where: {
        hotelId,
        status: StayStatus.ACTIVE,
        AND: [
          { checkInTime: { lt: checkOutDate } },
          { expectedCheckOutTime: { gt: checkInDate } },
        ],
      },
      select: { roomId: true },
    });

    const occupiedRoomIds = overlappingStays.map((s) => s.roomId);

    const where: any = {
      hotelId,
      status: { not: RoomStatus.OUT_OF_SERVICE },
      maintenanceStatus: MaintenanceStatus.OPERATIONAL,
      id: { notIn: occupiedRoomIds },
    };

    if (roomTypeId) {
      where.roomTypeId = roomTypeId;
    }

    const availableRooms = await this.prisma.room.findMany({
      where,
      include: { roomType: true },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });

    return availableRooms;
  }
}
