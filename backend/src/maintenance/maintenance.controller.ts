import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TaskStatus } from '@prisma/client';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Get('issues')
  async getIssues(@CurrentUser('hotelId') hotelId: string, @Query('status') status?: string) {
    return this.maintenanceService.getIssues(hotelId, status);
  }

  @Post('issues')
  async reportIssue(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.maintenanceService.reportIssue(hotelId, body, userId);
  }

  @Patch('issues/:id/status')
  async updateIssueStatus(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
    @Body('resolutionNotes') resolutionNotes: string,
  ) {
    return this.maintenanceService.updateIssueStatus(hotelId, id, status, resolutionNotes, userId);
  }
}
