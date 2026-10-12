import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRoleType } from '@prisma/client';

@Controller('catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('booking-sources')
  async getBookingSources(@CurrentUser('hotelId') hotelId: string) {
    return this.catalogService.getBookingSources(hotelId);
  }

  @Post('booking-sources')
  @Roles(UserRoleType.ADMIN)
  async createBookingSource(@CurrentUser('hotelId') hotelId: string, @Body() body: any) {
    return this.catalogService.createBookingSource(hotelId, body);
  }

  @Get('categories')
  async getCategories(@CurrentUser('hotelId') hotelId: string) {
    return this.catalogService.getCategories(hotelId);
  }

  @Get('items')
  async getServiceItems(
    @CurrentUser('hotelId') hotelId: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.catalogService.getServiceItems(hotelId, categoryId);
  }

  @Post('items')
  @Roles(UserRoleType.ADMIN)
  async createServiceItem(@CurrentUser('hotelId') hotelId: string, @Body() body: any) {
    return this.catalogService.createServiceItem(hotelId, body);
  }
}
