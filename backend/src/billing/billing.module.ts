import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PdfService } from './pdf.service';

@Module({
  providers: [BillingService, PdfService],
  controllers: [BillingController],
  exports: [BillingService, PdfService],
})
export class BillingModule {}
