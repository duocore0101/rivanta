import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomStatus, StayStatus, PaymentStatus, HousekeepingStatus, MaintenanceStatus } from '@prisma/client';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // 1. EXECUTIVE KPI CARDS
  async getKpiSummary(hotelId: string, timeframe: 'today' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    if (timeframe === 'today') {
      startDate = startOfDay(now);
    } else if (timeframe === 'week') {
      startDate = startOfDay(subDays(now, 7));
    } else if (timeframe === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = startOfMonth(now);
    }

    // Room counts
    const [
      totalRooms,
      occupiedRooms,
      availableRooms,
      cleaningRequired,
      maintenanceRooms,
    ] = await Promise.all([
      this.prisma.room.count({ where: { hotelId } }),
      this.prisma.room.count({ where: { hotelId, status: RoomStatus.OCCUPIED } }),
      this.prisma.room.count({ where: { hotelId, status: RoomStatus.AVAILABLE } }),
      this.prisma.room.count({ where: { hotelId, housekeepingStatus: { in: [HousekeepingStatus.DIRTY, HousekeepingStatus.CLEANING_IN_PROGRESS] } } }),
      this.prisma.room.count({ where: { hotelId, maintenanceStatus: MaintenanceStatus.UNDER_MAINTENANCE } }),
    ]);

    const sellableRooms = Math.max(1, totalRooms - maintenanceRooms);
    const occupancyPercentage = Number(((occupiedRooms / sellableRooms) * 100).toFixed(1));

    // Today's Check-ins & Check-outs
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [todayActualCheckIns, todayExpectedCheckIns, todayCompletedCheckOuts, todayExpectedCheckOuts] = await Promise.all([
      this.prisma.stay.count({
        where: { hotelId, checkInTime: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.reservation.count({
        where: { hotelId, checkInDate: { gte: todayStart, lte: todayEnd }, status: 'CONFIRMED' },
      }),
      this.prisma.stay.count({
        where: { hotelId, actualCheckOutTime: { gte: todayStart, lte: todayEnd }, status: StayStatus.COMPLETED },
      }),
      this.prisma.stay.count({
        where: { hotelId, expectedCheckOutTime: { gte: todayStart, lte: todayEnd }, status: StayStatus.ACTIVE },
      }),
    ]);

    // Financial calculations for timeframe
    const charges = await this.prisma.stayCharge.findMany({
      where: {
        stay: { hotelId },
        isVoided: false,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { totalAmount: true, taxAmount: true, discountAmount: true },
    });

    const recognizedRevenue = charges.reduce((acc, c) => acc + Number(c.totalAmount), 0);
    const totalTaxes = charges.reduce((acc, c) => acc + Number(c.taxAmount), 0);

    const payments = await this.prisma.payment.findMany({
      where: {
        hotelId,
        status: PaymentStatus.SUCCESS,
        paymentDate: { gte: startDate, lte: endDate },
      },
      select: { amount: true },
    });

    const totalCollected = payments.reduce((acc, p) => acc + Number(p.amount), 0);

    const refunds = await this.prisma.refund.findMany({
      where: {
        hotelId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { amount: true },
    });

    const totalRefunds = refunds.reduce((acc, r) => acc + Number(r.amount), 0);
    const netCashMovement = totalCollected - totalRefunds;

    // All-time active stays outstanding
    const activeStays = await this.prisma.stay.findMany({
      where: { hotelId, status: StayStatus.ACTIVE },
      include: {
        charges: { where: { isVoided: false }, select: { totalAmount: true } },
        payments: { where: { status: PaymentStatus.SUCCESS }, select: { amount: true } },
      },
    });

    let activeOutstandingBalance = 0;
    for (const s of activeStays) {
      const cSum = s.charges.reduce((acc, c) => acc + Number(c.totalAmount), 0);
      const pSum = s.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      activeOutstandingBalance += Math.max(0, cSum - pSum);
    }

    return {
      timeframe,
      kpis: {
        totalRevenue: recognizedRevenue,
        netCashCollected: netCashMovement,
        totalTaxes,
        occupancyPercentage,
        occupiedRooms,
        totalRooms,
        availableRooms,
        cleaningRequired,
        maintenanceRooms,
        todayActualCheckIns,
        todayExpectedRemainingCheckIns: todayExpectedCheckIns,
        todayCompletedCheckOuts,
        todayExpectedRemainingCheckOuts: todayExpectedCheckOuts,
        outstandingGuestBalances: activeOutstandingBalance,
      },
    };
  }

  // 2. REVENUE REPORT & TRENDS
  async getRevenueReport(hotelId: string, days = 30) {
    const startDate = subDays(new Date(), Number(days));

    const charges = await this.prisma.stayCharge.findMany({
      where: {
        stay: { hotelId },
        isVoided: false,
        createdAt: { gte: startDate },
      },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    // Breakdown by Category
    const categoryTotals: Record<string, { name: string; total: number; count: number }> = {};
    for (const c of charges) {
      const code = c.category?.code || 'OTHER';
      const name = c.category?.name || 'Other Charges';
      if (!categoryTotals[code]) {
        categoryTotals[code] = { name, total: 0, count: 0 };
      }
      categoryTotals[code].total += Number(c.totalAmount);
      categoryTotals[code].count += 1;
    }

    // Daily revenue trends
    const dailyMap: Record<string, { date: string; revenue: number; roomRev: number; fbRev: number; otherRev: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dailyMap[d] = { date: d, revenue: 0, roomRev: 0, fbRev: 0, otherRev: 0 };
    }

    for (const c of charges) {
      const d = format(c.createdAt, 'yyyy-MM-dd');
      if (dailyMap[d]) {
        const amt = Number(c.totalAmount);
        dailyMap[d].revenue += amt;
        if (c.category?.code === 'ROOM') {
          dailyMap[d].roomRev += amt;
        } else if (c.category?.code === 'FOOD_BEVERAGE' || c.category?.code === 'BAR') {
          dailyMap[d].fbRev += amt;
        } else {
          dailyMap[d].otherRev += amt;
        }
      }
    }

    return {
      dailyTrends: Object.values(dailyMap),
      categoryBreakdown: Object.values(categoryTotals),
    };
  }

  // 3. OCCUPANCY REPORT
  async getOccupancyReport(hotelId: string) {
    const totalRooms = await this.prisma.room.count({ where: { hotelId } });
    const rooms = await this.prisma.room.findMany({
      where: { hotelId },
      include: { roomType: true },
    });

    // Occupancy by Room Type
    const roomTypeStats: Record<string, { name: string; total: number; occupied: number }> = {};
    const floorStats: Record<number, { floor: number; total: number; occupied: number }> = {};

    for (const r of rooms) {
      const typeName = r.roomType.name;
      if (!roomTypeStats[typeName]) {
        roomTypeStats[typeName] = { name: typeName, total: 0, occupied: 0 };
      }
      roomTypeStats[typeName].total += 1;
      if (r.status === RoomStatus.OCCUPIED) {
        roomTypeStats[typeName].occupied += 1;
      }

      const fl = r.floor;
      if (!floorStats[fl]) {
        floorStats[fl] = { floor: fl, total: 0, occupied: 0 };
      }
      floorStats[fl].total += 1;
      if (r.status === RoomStatus.OCCUPIED) {
        floorStats[fl].occupied += 1;
      }
    }

    // Historical 7-day occupancy simulation based on active stays
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = subDays(new Date(), i);
      const dayStart = startOfDay(targetDate);
      const dayEnd = endOfDay(targetDate);

      const occupiedCount = await this.prisma.stay.count({
        where: {
          hotelId,
          checkInTime: { lte: dayEnd },
          expectedCheckOutTime: { gte: dayStart },
        },
      });

      const rate = totalRooms > 0 ? Number(((occupiedCount / totalRooms) * 100).toFixed(1)) : 0;
      trend.push({
        date: format(targetDate, 'dd MMM'),
        occupied: occupiedCount,
        rate,
      });
    }

    return {
      totalRooms,
      byRoomType: Object.values(roomTypeStats).map((s) => ({
        ...s,
        occupancyRate: s.total > 0 ? Number(((s.occupied / s.total) * 100).toFixed(1)) : 0,
      })),
      byFloor: Object.values(floorStats).map((s) => ({
        ...s,
        occupancyRate: s.total > 0 ? Number(((s.occupied / s.total) * 100).toFixed(1)) : 0,
      })),
      trend,
    };
  }

  // 4. BOOKING SOURCE ANALYTICS
  async getBookingSourceReport(hotelId: string) {
    const sources = await this.prisma.bookingSource.findMany({
      where: { hotelId },
      include: {
        stays: {
          include: {
            charges: { where: { isVoided: false } },
            payments: { where: { status: PaymentStatus.SUCCESS } },
          },
        },
      },
    });

    return sources.map((s) => {
      const totalBookings = s.stays.length;
      const totalNights = s.stays.reduce((acc, stay) => acc + stay.totalNights, 0);
      const bookingValue = s.stays.reduce((acc, stay) => {
        return acc + stay.charges.reduce((cAcc, c) => cAcc + Number(c.totalAmount), 0);
      }, 0);

      const paymentsReceived = s.stays.reduce((acc, stay) => {
        return acc + stay.payments.reduce((pAcc, p) => pAcc + Number(p.amount), 0);
      }, 0);

      const commissionEstimated = Number(((bookingValue * Number(s.commissionRate)) / 100).toFixed(2));

      return {
        id: s.id,
        name: s.name,
        code: s.code,
        commissionRate: Number(s.commissionRate),
        isDirect: s.isDirect,
        totalBookings,
        totalNights,
        bookingValue,
        paymentsReceived,
        commissionEstimated,
      };
    });
  }

  // 5. PAYMENT & METHOD ANALYTICS
  async getPaymentsReport(hotelId: string, days = 30) {
    const startDate = subDays(new Date(), Number(days));

    const payments = await this.prisma.payment.findMany({
      where: {
        hotelId,
        paymentDate: { gte: startDate },
      },
      include: {
        stay: { include: { guest: true, room: true } },
        receivedByUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    const methodTotals: Record<string, { method: string; total: number; count: number }> = {};
    for (const p of payments) {
      if (!methodTotals[p.paymentMethod]) {
        methodTotals[p.paymentMethod] = { method: p.paymentMethod, total: 0, count: 0 };
      }
      if (p.status === PaymentStatus.SUCCESS) {
        methodTotals[p.paymentMethod].total += Number(p.amount);
      }
      methodTotals[p.paymentMethod].count += 1;
    }

    return {
      payments,
      byMethod: Object.values(methodTotals),
    };
  }
}
