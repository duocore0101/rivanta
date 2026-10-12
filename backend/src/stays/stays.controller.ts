import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { StaysService } from './stays.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('stays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaysController {
  constructor(private staysService: StaysService) {}

  @Get()
  async getAllStays(
    @CurrentUser('hotelId') hotelId: string,
    @Query('status') status?: string,
    @Query('filter') filter?: 'ARRIVALS_TODAY' | 'DEPARTURES_TODAY' | 'IN_HOUSE',
  ) {
    return this.staysService.getAllStays(hotelId, status, filter);
  }

  @Get(':id')
  async getStayById(@CurrentUser('hotelId') hotelId: string, @Param('id') id: string) {
    return this.staysService.getStayById(hotelId, id);
  }

  @Post('check-in')
  async checkIn(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.staysService.checkIn(hotelId, body, userId);
  }

  @Post(':id/charges')
  async addCharge(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Param('id') stayId: string,
    @Body() body: any,
  ) {
    return this.staysService.addCharge(hotelId, stayId, body, userId);
  }

  @Post('charges/:chargeId/void')
  async voidCharge(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Param('chargeId') chargeId: string,
    @Body('reason') reason: string,
  ) {
    return this.staysService.voidCharge(hotelId, chargeId, reason, userId);
  }

  @Post(':id/extend')
  async extendStay(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Param('id') stayId: string,
    @Body('newCheckOutTime') newCheckOutTime: string,
  ) {
    return this.staysService.extendStay(hotelId, stayId, newCheckOutTime, userId);
  }

  @Post(':id/checkout')
  async checkout(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Param('id') stayId: string,
    @Body('forceUnpaid') forceUnpaid?: boolean,
  ) {
    return this.staysService.checkout(hotelId, stayId, userId, forceUnpaid);
  }
}
