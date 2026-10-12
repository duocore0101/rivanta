import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TaskStatus } from '@prisma/client';

@Controller('housekeeping')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HousekeepingController {
  constructor(private housekeepingService: HousekeepingService) {}

  @Get('tasks')
  async getTasks(@CurrentUser('hotelId') hotelId: string, @Query('status') status?: string) {
    return this.housekeepingService.getTasks(hotelId, status);
  }

  @Post('tasks')
  async createTask(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.housekeepingService.createTask(hotelId, body, userId);
  }

  @Patch('tasks/:id/status')
  async updateTaskStatus(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
  ) {
    return this.housekeepingService.updateTaskStatus(hotelId, id, status, userId);
  }
}
