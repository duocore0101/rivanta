import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('kpis')
  async getKpiSummary(
    @CurrentUser('hotelId') hotelId: string,
    @Query('timeframe') timeframe?: 'today' | 'week' | 'month' | 'year',
  ) {
    return this.reportsService.getKpiSummary(hotelId, timeframe);
  }

  @Get('revenue')
  async getRevenueReport(
    @CurrentUser('hotelId') hotelId: string,
    @Query('days') days?: number,
  ) {
    return this.reportsService.getRevenueReport(hotelId, days);
  }

  @Get('occupancy')
  async getOccupancyReport(@CurrentUser('hotelId') hotelId: string) {
    return this.reportsService.getOccupancyReport(hotelId);
  }

  @Get('bookings')
  async getBookingSourceReport(@CurrentUser('hotelId') hotelId: string) {
    return this.reportsService.getBookingSourceReport(hotelId);
  }

  @Get('payments')
  async getPaymentsReport(
    @CurrentUser('hotelId') hotelId: string,
    @Query('days') days?: number,
  ) {
    return this.reportsService.getPaymentsReport(hotelId, days);
  }
}
