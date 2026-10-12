import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRoleType, HousekeepingStatus } from '@prisma/client';

@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  async getAllRooms(
    @CurrentUser('hotelId') hotelId: string,
    @Query('status') status?: string,
    @Query('housekeepingStatus') housekeepingStatus?: string,
    @Query('floor') floor?: number,
  ) {
    return this.roomsService.getAllRooms(hotelId, status, housekeepingStatus, floor);
  }

  @Get('availability')
  async checkAvailability(
    @CurrentUser('hotelId') hotelId: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('roomTypeId') roomTypeId?: string,
  ) {
    return this.roomsService.checkAvailability(hotelId, checkIn, checkOut, roomTypeId);
  }

  @Get(':id')
  async getRoomById(@CurrentUser('hotelId') hotelId: string, @Param('id') id: string) {
    return this.roomsService.getRoomById(hotelId, id);
  }

  @Post()
  @Roles(UserRoleType.ADMIN)
  async createRoom(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.roomsService.createRoom(hotelId, body, userId);
  }

  @Patch(':id')
  @Roles(UserRoleType.ADMIN, UserRoleType.RECEPTIONIST)
  async updateRoom(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.roomsService.updateRoom(hotelId, id, body, userId);
  }

  @Patch(':id/housekeeping')
  @Roles(UserRoleType.ADMIN, UserRoleType.RECEPTIONIST, UserRoleType.HOUSEKEEPING)
  async updateHousekeeping(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('housekeepingStatus') housekeepingStatus: HousekeepingStatus,
  ) {
    return this.roomsService.updateHousekeeping(hotelId, id, housekeepingStatus, userId);
  }
}

@Controller('room-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomTypesController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  async getAllRoomTypes(@CurrentUser('hotelId') hotelId: string) {
    return this.roomsService.getAllRoomTypes(hotelId);
  }

  @Post()
  @Roles(UserRoleType.ADMIN)
  async createRoomType(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.roomsService.createRoomType(hotelId, body, userId);
  }

  @Patch(':id')
  @Roles(UserRoleType.ADMIN)
  async updateRoomType(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.roomsService.updateRoomType(hotelId, id, body, userId);
  }
}
