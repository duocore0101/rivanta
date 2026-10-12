import { Controller, Get, Post, Param, Body, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationChannel } from '@prisma/client';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post('payments')
  async recordPayment(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.billingService.recordPayment(hotelId, body, userId);
  }

  @Post('refunds')
  async processRefund(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.billingService.processRefund(hotelId, body, userId);
  }

  @Post('invoices/generate')
  async generateInvoice(
    @CurrentUser('hotelId') hotelId: string,
    @CurrentUser('id') userId: string,
    @Body('stayId') stayId: string,
  ) {
    return this.billingService.generateInvoice(hotelId, stayId, userId);
  }

  @Get('invoices')
  async getInvoices(
    @CurrentUser('hotelId') hotelId: string,
    @Query('status') status?: string,
    @Query('query') query?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.billingService.getInvoices(hotelId, status, query, page, limit);
  }

  @Get('invoices/:id')
  async getInvoiceById(@CurrentUser('hotelId') hotelId: string, @Param('id') id: string) {
    return this.billingService.getInvoiceById(hotelId, id);
  }

  @Get('invoices/:id/pdf')
  async downloadInvoicePdf(
    @CurrentUser('hotelId') hotelId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.billingService.getInvoicePdfBuffer(hotelId, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post('invoices/:id/share')
  async shareInvoice(
    @CurrentUser('hotelId') hotelId: string,
    @Param('id') id: string,
    @Body('channel') channel: NotificationChannel,
    @Body('recipient') recipient: string,
  ) {
    return this.billingService.shareInvoice(hotelId, id, channel, recipient);
  }
}
