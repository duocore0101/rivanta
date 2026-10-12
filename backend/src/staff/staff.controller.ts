import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRoleType } from '@prisma/client';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  @Roles(UserRoleType.ADMIN)
  async getAllStaff(@CurrentUser('hotelId') hotelId: string) {
    return this.staffService.getAllStaff(hotelId);
  }

  @Post()
  @Roles(UserRoleType.ADMIN)
  async createStaff(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.staffService.createStaff(hotelId, body, userId);
  }

  @Patch(':id/status')
  @Roles(UserRoleType.ADMIN)
  async toggleStaffStatus(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.staffService.toggleStaffStatus(hotelId, id, isActive, userId);
  }
}
