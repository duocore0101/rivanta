import { Controller, Get, Patch, Body, UseGuards, Post } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRoleType } from '@prisma/client';

@Controller('hotel')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HotelController {
  constructor(private hotelService: HotelService) {}

  @Get()
  async getHotel(@CurrentUser('hotelId') hotelId: string) {
    return this.hotelService.getHotel(hotelId);
  }

  @Patch()
  @Roles(UserRoleType.ADMIN)
  async updateHotel(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.hotelService.updateHotel(hotelId, body, userId);
  }

  @Get('settings')
  async getSettings(@CurrentUser('hotelId') hotelId: string) {
    return this.hotelService.getSettings(hotelId);
  }

  @Patch('settings')
  @Roles(UserRoleType.ADMIN)
  async updateSettings(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.hotelService.updateSettings(hotelId, body, userId);
  }

  @Post('declaration')
  @Roles(UserRoleType.ADMIN)
  async updateDeclaration(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { title: string; content: string },
  ) {
    return this.hotelService.updateDeclaration(hotelId, body, userId);
  }
}
