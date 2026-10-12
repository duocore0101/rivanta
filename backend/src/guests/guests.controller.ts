import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('guests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuestsController {
  constructor(private guestsService: GuestsService) {}

  @Get()
  async getAllGuests(
    @CurrentUser('hotelId') hotelId: string,
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.guestsService.getAllGuests(hotelId, query, page, limit);
  }

  @Get('check-duplicate')
  async checkDuplicate(
    @CurrentUser('hotelId') hotelId: string,
    @Query('phone') phone: string,
    @Query('email') email?: string,
  ) {
    return this.guestsService.checkDuplicate(hotelId, phone, email);
  }

  @Get(':id')
  async getGuestById(@CurrentUser('hotelId') hotelId: string, @Param('id') id: string) {
    return this.guestsService.getGuestById(hotelId, id);
  }

  @Post()
  async createGuest(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.guestsService.createGuest(hotelId, body, userId);
  }

  @Patch(':id')
  async updateGuest(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.guestsService.updateGuest(hotelId, id, body, userId);
  }
}
