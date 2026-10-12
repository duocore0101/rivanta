import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HotelModule } from './hotel/hotel.module';
import { RoomsModule } from './rooms/rooms.module';
import { GuestsModule } from './guests/guests.module';
import { StaysModule } from './stays/stays.module';
import { BillingModule } from './billing/billing.module';
import { HousekeepingModule } from './housekeeping/housekeeping.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ReportsModule } from './reports/reports.module';
import { StaffModule } from './staff/staff.module';
import { AuditModule } from './audit/audit.module';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HotelModule,
    RoomsModule,
    GuestsModule,
    StaysModule,
    BillingModule,
    HousekeepingModule,
    MaintenanceModule,
    ReportsModule,
    StaffModule,
    AuditModule,
    CatalogModule,
  ],
})
export class AppModule {}
