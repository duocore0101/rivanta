import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StayStatus, RoomStatus, HousekeepingStatus, PaymentMethod, PaymentType, PaymentStatus, IdDocumentType } from '@prisma/client';
import { differenceInCalendarDays } from 'date-fns';

@Injectable()
export class StaysService {
  constructor(private prisma: PrismaService) {}

  async getAllStays(hotelId: string, status?: string, filter?: 'ARRIVALS_TODAY' | 'DEPARTURES_TODAY' | 'IN_HOUSE') {
    const where: any = { hotelId };

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (filter === 'ARRIVALS_TODAY') {
      where.checkInTime = { gte: startOfToday, lte: endOfToday };
    } else if (filter === 'DEPARTURES_TODAY') {
      where.status = StayStatus.ACTIVE;
      where.expectedCheckOutTime = { gte: startOfToday, lte: endOfToday };
    } else if (filter === 'IN_HOUSE') {
      where.status = StayStatus.ACTIVE;
    } else if (status && status !== 'ALL') {
      where.status = status as StayStatus;
    }

    const stays = await this.prisma.stay.findMany({
      where,
      include: {
        guest: true,
        room: { include: { roomType: true } },
        bookingSource: true,
        charges: { where: { isVoided: false } },
        payments: { where: { status: PaymentStatus.SUCCESS } },
        invoices: true,
      },
      orderBy: { checkInTime: 'desc' },
    });

    // Compute balance for each stay
    return stays.map((s) => {
      const totalCharges = s.charges.reduce((acc, c) => acc + Number(c.totalAmount), 0);
      const totalPayments = s.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const outstandingBalance = totalCharges - totalPayments;
      return {
        ...s,
        financials: {
          totalCharges,
          totalPayments,
          outstandingBalance,
        },
      };
    });
  }

  async getStayById(hotelId: string, id: string) {
    const stay = await this.prisma.stay.findFirst({
      where: { id, hotelId },
      include: {
        guest: true,
        room: { include: { roomType: true } },
        bookingSource: true,
        charges: {
          include: { category: true, serviceItem: true, createdByUser: true },
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          include: { receivedByUser: true },
          orderBy: { createdAt: 'desc' },
        },
        refunds: {
          include: { approvedByUser: true, processedByUser: true },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          include: { lineItems: true },
          orderBy: { createdAt: 'desc' },
        },
        declarationAcceptances: {
          include: { declarationVersion: true },
          orderBy: { signedAt: 'desc' },
        },
        createdByUser: true,
        checkedOutByUser: true,
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay record not found');
    }

    const validCharges = stay.charges.filter((c) => !c.isVoided);
    const subtotal = validCharges.reduce((acc, c) => acc + (Number(c.quantity) * Number(c.unitPrice) - Number(c.discountAmount)), 0);
    const taxTotal = validCharges.reduce((acc, c) => acc + Number(c.taxAmount), 0);
    const totalCharges = validCharges.reduce((acc, c) => acc + Number(c.totalAmount), 0);
    const successfulPayments = stay.payments.filter((p) => p.status === PaymentStatus.SUCCESS);
    const totalPayments = successfulPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalRefunds = stay.refunds.reduce((acc, r) => acc + Number(r.amount), 0);
    const netPayments = totalPayments - totalRefunds;
    const outstandingBalance = totalCharges - netPayments;

    return {
      ...stay,
      folio: {
        subtotal,
        taxTotal,
        totalCharges,
        totalPayments,
        totalRefunds,
        netPayments,
        outstandingBalance,
      },
    };
  }

  // ATOMIC CHECK-IN WORKFLOW
  async checkIn(hotelId: string, data: any, userId: string) {
    const {
      guestData,
      stayData,
      bookingSourceData,
      advancePayment,
      declarationAcceptance,
    } = data;

    // 1. Validation
    if (!stayData?.roomId || !stayData?.checkInTime || !stayData?.expectedCheckOutTime) {
      throw new BadRequestException('Room, check-in, and expected check-out dates are required.');
    }

    const checkInDate = new Date(stayData.checkInTime);
    const checkOutDate = new Date(stayData.expectedCheckOutTime);

    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('Check-out date must be strictly after check-in date.');
    }

    // 2. Transaction Execution
    return this.prisma.$transaction(async (tx) => {
      // Check room availability atomically
      const room = await tx.room.findFirst({
        where: { id: stayData.roomId, hotelId },
        include: { roomType: true },
      });

      if (!room) {
        throw new NotFoundException('Selected room not found.');
      }

      if (room.status === RoomStatus.OCCUPIED) {
        throw new ConflictException(`Room ${room.roomNumber} is currently occupied.`);
      }

      if (room.status === RoomStatus.OUT_OF_SERVICE) {
        throw new ConflictException(`Room ${room.roomNumber} is out of service.`);
      }

      // Check for overlapping active stays
      const conflictingStay = await tx.stay.findFirst({
        where: {
          roomId: room.id,
          status: StayStatus.ACTIVE,
          AND: [
            { checkInTime: { lt: checkOutDate } },
            { expectedCheckOutTime: { gt: checkInDate } },
          ],
        },
      });

      if (conflictingStay) {
        throw new ConflictException(`Room ${room.roomNumber} already has an active stay in this date range.`);
      }

      // 3. Find or Create Guest
      let guestId = guestData.id;
      if (!guestId) {
        let existingGuest = await tx.guest.findFirst({
          where: { hotelId, phone: guestData.phone?.trim() },
        });

        if (existingGuest) {
          guestId = existingGuest.id;
        } else {
          const newGuest = await tx.guest.create({
            data: {
              hotelId,
              fullName: guestData.fullName.trim(),
              phone: guestData.phone.trim(),
              email: guestData.email ? guestData.email.trim().toLowerCase() : null,
              address: guestData.address,
              city: guestData.city,
              state: guestData.state,
              postalCode: guestData.postalCode,
              country: guestData.country || 'India',
              nationality: guestData.nationality || 'Indian',
              idType: guestData.idType || IdDocumentType.AADHAAR,
              idNumber: guestData.idNumber.trim(),
              emergencyContactName: guestData.emergencyContactName,
              emergencyContactPhone: guestData.emergencyContactPhone,
              isVip: !!guestData.isVip,
            },
          });
          guestId = newGuest.id;
        }
      }

      // 4. Calculate Nights & Rate
      const nights = Math.max(1, differenceInCalendarDays(checkOutDate, checkInDate));
      const ratePerNight = Number(stayData.ratePerNight) || Number(room.rateOverride) || Number(room.roomType.basePrice);

      // Unique Stay Number
      const stayCount = await tx.stay.count({ where: { hotelId } });
      const year = new Date().getFullYear();
      const stayNumber = `STY-${year}-${String(stayCount + 1).padStart(4, '0')}`;

      // 5. Booking Source
      let bookingSourceId = bookingSourceData?.bookingSourceId;
      if (!bookingSourceId) {
        const walkIn = await tx.bookingSource.findFirst({
          where: { hotelId, code: 'WALK_IN' },
        });
        bookingSourceId = walkIn ? walkIn.id : (await tx.bookingSource.findFirst({ where: { hotelId } }))?.id;
      }

      // 6. Create Stay Record
      const stay = await tx.stay.create({
        data: {
          hotelId,
          guestId,
          roomId: room.id,
          bookingSourceId,
          stayNumber,
          checkInTime: checkInDate,
          expectedCheckOutTime: checkOutDate,
          adultsCount: Number(stayData.adultsCount) || 1,
          childrenCount: Number(stayData.childrenCount) || 0,
          totalNights: nights,
          ratePerNight,
          status: StayStatus.ACTIVE,
          externalBookingRef: bookingSourceData?.externalBookingRef || null,
          partnerCommissionAmount: bookingSourceData?.partnerCommissionAmount ? Number(bookingSourceData.partnerCommissionAmount) : null,
          partnerCommissionStatus: bookingSourceData?.partnerCommissionAmount ? 'PENDING' : null,
          partnerCollectedAmount: bookingSourceData?.partnerCollectedAmount ? Number(bookingSourceData.partnerCollectedAmount) : null,
          paymentResponsibility: bookingSourceData?.paymentResponsibility || 'GUEST',
          specialRequests: stayData.specialRequests || null,
          staffNotes: stayData.staffNotes || null,
          createdByUserId: userId,
        },
      });

      // 7. Update Room Status to OCCUPIED atomically
      await tx.room.update({
        where: { id: room.id },
        data: {
          status: RoomStatus.OCCUPIED,
        },
      });

      // 8. Add Room Charge Line Items
      const roomCategory = await tx.chargeCategory.findFirst({
        where: { hotelId, code: 'ROOM' },
      });

      const taxRate = roomCategory ? Number(roomCategory.taxRatePercent) : 12.0;
      const subtotalTariff = ratePerNight * nights;
      const taxAmount = Number(((subtotalTariff * taxRate) / 100).toFixed(2));
      const totalRoomCharge = Number((subtotalTariff + taxAmount).toFixed(2));

      await tx.stayCharge.create({
        data: {
          stayId: stay.id,
          categoryId: roomCategory?.id || (await tx.chargeCategory.findFirst({ where: { hotelId } }))?.id,
          description: `${room.roomType.name} Room Tariff (${nights} ${nights === 1 ? 'night' : 'nights'} @ ₹${ratePerNight}/night)`,
          quantity: nights,
          unitPrice: ratePerNight,
          taxPercent: taxRate,
          taxAmount,
          discountAmount: 0.0,
          totalAmount: totalRoomCharge,
          createdByUserId: userId,
        },
      });

      // 9. Digital Declaration & Signature
      if (declarationAcceptance?.signatureUrl) {
        const activeDeclaration = await tx.guestDeclarationVersion.findFirst({
          where: { hotelId, isActive: true },
          orderBy: { versionNumber: 'desc' },
        });

        if (activeDeclaration) {
          await tx.guestDeclarationAcceptance.create({
            data: {
              stayId: stay.id,
              guestId,
              declarationVersionId: activeDeclaration.id,
              accepted: true,
              signatureUrl: declarationAcceptance.signatureUrl,
              signedByStaffId: userId,
            },
          });
        }
      }

      // 10. Record Advance Payment if provided
      if (advancePayment && Number(advancePayment.amount) > 0) {
        const paymentCount = await tx.payment.count({ where: { hotelId } });
        const paymentNumber = `PAY-${year}-${String(paymentCount + 1).padStart(4, '0')}`;

        await tx.payment.create({
          data: {
            hotelId,
            stayId: stay.id,
            paymentNumber,
            amount: Number(advancePayment.amount),
            paymentMethod: advancePayment.paymentMethod || PaymentMethod.CASH,
            paymentType: PaymentType.ADVANCE,
            status: PaymentStatus.SUCCESS,
            transactionReference: advancePayment.transactionReference || null,
            notes: advancePayment.notes || 'Advance payment collected during check-in',
            receivedByUserId: userId,
          },
        });
      }

      // 11. Create Audit Log
      await tx.auditLog.create({
        data: {
          hotelId,
          userId,
          action: 'GUEST_CHECK_IN',
          entityType: 'STAY',
          entityId: stay.id,
          details: {
            stayNumber,
            roomNumber: room.roomNumber,
            nights,
            advanceCollected: advancePayment?.amount || 0,
          },
        },
      });

      return stay;
    });
  }

  // ADD CHARGE TO STAY
  async addCharge(hotelId: string, stayId: string, data: any, userId: string) {
    const stay = await this.prisma.stay.findFirst({
      where: { id: stayId, hotelId },
    });

    if (!stay) {
      throw new NotFoundException('Stay record not found.');
    }

    if (stay.status !== StayStatus.ACTIVE && stay.status !== StayStatus.EXTENDED) {
      throw new BadRequestException('Cannot add charges to a closed or cancelled stay.');
    }

    const quantity = Math.max(1, Number(data.quantity) || 1);
    const unitPrice = Number(data.unitPrice) || 0;
    const discountAmount = Number(data.discountAmount) || 0;
    const taxPercent = Number(data.taxPercent) || 0;

    const baseAmount = quantity * unitPrice - discountAmount;
    const taxAmount = Number(((baseAmount * taxPercent) / 100).toFixed(2));
    const totalAmount = Number((baseAmount + taxAmount).toFixed(2));

    const charge = await this.prisma.stayCharge.create({
      data: {
        stayId,
        categoryId: data.categoryId,
        serviceItemId: data.serviceItemId || null,
        description: data.description,
        quantity,
        unitPrice,
        taxPercent,
        taxAmount,
        discountAmount,
        totalAmount,
        orderReference: data.orderReference || null,
        createdByUserId: userId,
      },
      include: { category: true },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'ADD_STAY_CHARGE',
        entityType: 'STAY_CHARGE',
        entityId: charge.id,
        details: { description: charge.description, totalAmount: charge.totalAmount },
      },
    });

    return charge;
  }

  // VOID CHARGE
  async voidCharge(hotelId: string, chargeId: string, reason: string, userId: string) {
    const charge = await this.prisma.stayCharge.findUnique({
      where: { id: chargeId },
      include: { stay: true },
    });

    if (!charge || charge.stay.hotelId !== hotelId) {
      throw new NotFoundException('Charge not found.');
    }

    if (charge.isVoided) {
      throw new BadRequestException('Charge is already voided.');
    }

    const updated = await this.prisma.stayCharge.update({
      where: { id: chargeId },
      data: {
        isVoided: true,
        voidReason: reason || 'Authorized void by management',
        voidedByUserId: userId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        hotelId,
        userId,
        action: 'VOID_STAY_CHARGE',
        entityType: 'STAY_CHARGE',
        entityId: chargeId,
        details: { description: charge.description, amount: charge.totalAmount, reason },
      },
    });

    return updated;
  }

  // ROOM EXTENSION WORKFLOW
  async extendStay(hotelId: string, stayId: string, newCheckOutTime: string, userId: string) {
    const stay = await this.prisma.stay.findFirst({
      where: { id: stayId, hotelId },
      include: { room: { include: { roomType: true } } },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found.');
    }

    if (stay.status !== StayStatus.ACTIVE) {
      throw new BadRequestException('Only active stays can be extended.');
    }

    const newCheckOut = new Date(newCheckOutTime);
    if (newCheckOut <= stay.expectedCheckOutTime) {
      throw new BadRequestException('New checkout date must be later than the current expected checkout date.');
    }

    // Check for conflicting reservations on this room
    const conflict = await this.prisma.stay.findFirst({
      where: {
        roomId: stay.roomId,
        id: { not: stay.id },
        status: StayStatus.ACTIVE,
        AND: [
          { checkInTime: { lt: newCheckOut } },
          { expectedCheckOutTime: { gt: stay.expectedCheckOutTime } },
        ],
      },
    });

    if (conflict) {
      throw new ConflictException('Room cannot be extended because another stay or reservation overlaps this extended period.');
    }

    const additionalNights = Math.max(1, differenceInCalendarDays(newCheckOut, stay.expectedCheckOutTime));
    const ratePerNight = Number(stay.ratePerNight);

    return this.prisma.$transaction(async (tx) => {
      const roomCat = await tx.chargeCategory.findFirst({ where: { hotelId, code: 'ROOM' } });
      const taxRate = roomCat ? Number(roomCat.taxRatePercent) : 12.0;
      const subtotalTariff = ratePerNight * additionalNights;
      const taxAmount = Number(((subtotalTariff * taxRate) / 100).toFixed(2));
      const totalCharge = Number((subtotalTariff + taxAmount).toFixed(2));

      // Post additional nights charge
      await tx.stayCharge.create({
        data: {
          stayId: stay.id,
          categoryId: roomCat?.id || (await tx.chargeCategory.findFirst({ where: { hotelId } }))?.id,
          description: `Stay Extension: ${stay.room.roomType.name} (${additionalNights} extra ${additionalNights === 1 ? 'night' : 'nights'} @ ₹${ratePerNight}/night)`,
          quantity: additionalNights,
          unitPrice: ratePerNight,
          taxPercent: taxRate,
          taxAmount,
          discountAmount: 0.0,
          totalAmount: totalCharge,
          createdByUserId: userId,
        },
      });

      const updatedStay = await tx.stay.update({
        where: { id: stay.id },
        data: {
          expectedCheckOutTime: newCheckOut,
          totalNights: stay.totalNights + additionalNights,
          status: StayStatus.EXTENDED,
        },
      });

      await tx.auditLog.create({
        data: {
          hotelId,
          userId,
          action: 'EXTEND_STAY',
          entityType: 'STAY',
          entityId: stay.id,
          details: {
            oldCheckOut: stay.expectedCheckOutTime,
            newCheckOut,
            additionalNights,
            chargeAdded: totalCharge,
          },
        },
      });

      return updatedStay;
    });
  }

  // CHECKOUT WORKFLOW
  async checkout(hotelId: string, stayId: string, userId: string, forceUnpaid = false) {
    const stay = await this.prisma.stay.findFirst({
      where: { id: stayId, hotelId },
      include: {
        charges: { where: { isVoided: false } },
        payments: { where: { status: PaymentStatus.SUCCESS } },
        room: true,
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found.');
    }

    if (stay.status === StayStatus.COMPLETED) {
      throw new BadRequestException('This stay has already been completed and checked out.');
    }

    const totalCharges = stay.charges.reduce((acc, c) => acc + Number(c.totalAmount), 0);
    const totalPayments = stay.payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const outstanding = Number((totalCharges - totalPayments).toFixed(2));

    const settings = await this.prisma.hotelSetting.findUnique({ where: { hotelId } });
    if (outstanding > 0.01 && !settings?.allowUnpaidCheckout && !forceUnpaid) {
      throw new BadRequestException(
        `Cannot checkout. Outstanding balance of ₹${outstanding.toLocaleString('en-IN')} remains. Please collect payment or get managerial override.`
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark stay as COMPLETED
      const completedStay = await tx.stay.update({
        where: { id: stay.id },
        data: {
          status: StayStatus.COMPLETED,
          actualCheckOutTime: new Date(),
          checkedOutByUserId: userId,
        },
      });

      // 2. Set Room to AVAILABLE, Housekeeping to DIRTY (cleaning required)
      await tx.room.update({
        where: { id: stay.roomId },
        data: {
          status: RoomStatus.AVAILABLE,
          housekeepingStatus: HousekeepingStatus.DIRTY,
        },
      });

      // 3. Create Housekeeping turnover task
      await tx.housekeepingTask.create({
        data: {
          hotelId,
          roomId: stay.roomId,
          stayId: stay.id,
          taskType: 'TURNOVER',
          status: 'PENDING',
          priority: 'HIGH',
          notes: `Post-checkout cleaning and linen change for Room ${stay.room.roomNumber}`,
        },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          hotelId,
          userId,
          action: 'GUEST_CHECKOUT',
          entityType: 'STAY',
          entityId: stay.id,
          details: {
            roomNumber: stay.room.roomNumber,
            totalCharges,
            totalPayments,
            outstandingBalance: outstanding,
          },
        },
      });

      return completedStay;
    });
  }
}
