import { PrismaClient, UserRoleType, RoomStatus, HousekeepingStatus, MaintenanceStatus, StayStatus, IdDocumentType, PaymentMethod, PaymentType, PaymentStatus, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Rivanta Hotel Management System database...');

  // 1. Create or update Hotel
  const hotel = await prisma.hotel.upsert({
    where: { id: 'hotel-rivanta-main-001' },
    update: {},
    create: {
      id: 'hotel-rivanta-main-001',
      name: 'Rivanta Luxury Hotel & Suites',
      legalName: 'Rivanta Hospitality Private Limited',
      address: '74/B Royal Palms Boulevard, Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400076',
      phone: '+91 22 8920 1100',
      email: 'reservations@rivanta.com',
      website: 'https://rivanta-hospitality.com',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
  });

  // 2. Hotel Settings
  await prisma.hotelSetting.upsert({
    where: { hotelId: hotel.id },
    update: {},
    create: {
      hotelId: hotel.id,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      defaultTaxRate: 12.0,
      invoicePrefix: 'RIV-',
      allowUnpaidCheckout: false,
      currency: 'INR',
      currencySymbol: '₹',
      timezone: 'Asia/Kolkata',
    },
  });

  // 3. Tax Configurations
  const gst12 = await prisma.taxConfiguration.create({
    data: {
      hotelId: hotel.id,
      name: 'GST 12%',
      ratePercent: 12.0,
      isInclusive: false,
      category: 'ROOM',
    },
  });

  const gst5 = await prisma.taxConfiguration.create({
    data: {
      hotelId: hotel.id,
      name: 'GST 5% (F&B)',
      ratePercent: 5.0,
      isInclusive: false,
      category: 'FOOD_BEVERAGE',
    },
  });

  const gst18 = await prisma.taxConfiguration.create({
    data: {
      hotelId: hotel.id,
      name: 'GST 18% (Bar & Spa)',
      ratePercent: 18.0,
      isInclusive: false,
      category: 'BAR_SPA',
    },
  });

  // 4. Booking Sources
  const bookingSourcesData = [
    { name: 'Walk-in', code: 'WALK_IN', commissionRate: 0.0, isDirect: true },
    { name: 'Hotel Website (Direct)', code: 'WEBSITE', commissionRate: 0.0, isDirect: true },
    { name: 'Phone / WhatsApp Reservation', code: 'PHONE', commissionRate: 0.0, isDirect: true },
    { name: 'Agoda', code: 'AGODA', commissionRate: 15.0, isDirect: false },
    { name: 'MakeMyTrip', code: 'MMT', commissionRate: 18.0, isDirect: false },
    { name: 'Booking.com', code: 'BOOKING_COM', commissionRate: 15.0, isDirect: false },
    { name: 'Expedia', code: 'EXPEDIA', commissionRate: 18.0, isDirect: false },
    { name: 'Corporate Partner', code: 'CORPORATE', commissionRate: 8.0, isDirect: false },
    { name: 'Travel Agent', code: 'TRAVEL_AGENT', commissionRate: 10.0, isDirect: false },
    { name: 'Referral / Other', code: 'OTHER', commissionRate: 0.0, isDirect: true },
  ];

  const bookingSources: Record<string, any> = {};
  for (const bs of bookingSourcesData) {
    const created = await prisma.bookingSource.upsert({
      where: { hotelId_code: { hotelId: hotel.id, code: bs.code } },
      update: {},
      create: {
        hotelId: hotel.id,
        name: bs.name,
        code: bs.code,
        commissionRate: bs.commissionRate,
        isDirect: bs.isDirect,
      },
    });
    bookingSources[bs.code] = created;
  }

  // 5. Default Declaration Version
  const declaration = await prisma.guestDeclarationVersion.upsert({
    where: { hotelId_versionNumber: { hotelId: hotel.id, versionNumber: 1 } },
    update: {},
    create: {
      hotelId: hotel.id,
      versionNumber: 1,
      title: 'Rivanta Guest Stay Agreement & House Rules',
      content: `1. Check-in is at 2:00 PM and check-out is strictly at 11:00 AM. Late check-out is subject to room availability and nominal fee.\n2. In accordance with government regulations, all guests must present valid government photo identification upon arrival.\n3. The property operates a strict non-smoking policy in all guest rooms. Designated smoking areas are available outside.\n4. Guests are expected to maintain peace and quiet between 10:00 PM and 7:00 AM.\n5. Any damage to hotel property, linens, or equipment will be charged to the guest's folio.\n6. Valuables should be secured in the in-room electronic safe. The hotel accepts no liability for unmonitored belongings.\n7. Outstanding bills must be fully settled before keys are returned at checkout.`,
      isActive: true,
    },
  });

  // 6. Users & Roles
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rivanta.com' },
    update: {},
    create: {
      hotelId: hotel.id,
      email: 'admin@rivanta.com',
      passwordHash,
      firstName: 'Vikram',
      lastName: 'Singhania',
      role: UserRoleType.ADMIN,
      phone: '+91 98200 12345',
    },
  });

  const receptionistUser = await prisma.user.upsert({
    where: { email: 'receptionist@rivanta.com' },
    update: {},
    create: {
      hotelId: hotel.id,
      email: 'receptionist@rivanta.com',
      passwordHash,
      firstName: 'Pooja',
      lastName: 'Sharma',
      role: UserRoleType.RECEPTIONIST,
      phone: '+91 98200 54321',
    },
  });

  const housekeepingUser = await prisma.user.upsert({
    where: { email: 'housekeeping@rivanta.com' },
    update: {},
    create: {
      hotelId: hotel.id,
      email: 'housekeeping@rivanta.com',
      passwordHash,
      firstName: 'Ramesh',
      lastName: 'Kumar',
      role: UserRoleType.HOUSEKEEPING,
      phone: '+91 98200 98765',
    },
  });

  const accountantUser = await prisma.user.upsert({
    where: { email: 'accountant@rivanta.com' },
    update: {},
    create: {
      hotelId: hotel.id,
      email: 'accountant@rivanta.com',
      passwordHash,
      firstName: 'Anjali',
      lastName: 'Deshmukh',
      role: UserRoleType.ACCOUNTANT,
      phone: '+91 98200 67890',
    },
  });

  // 7. Room Types
  const roomTypesData = [
    {
      code: 'DLX_STE',
      name: 'Deluxe Suite',
      basePrice: 6500.0,
      maxOccupancy: 3,
      bedsCount: 2,
      sizeSqFt: 480,
      amenities: ['King Bed', 'City View', 'Balcony', 'Mini Bar', 'High-Speed Wi-Fi', 'Smart TV', 'Bathtub'],
    },
    {
      code: 'EXE_KNG',
      name: 'Executive King',
      basePrice: 4800.0,
      maxOccupancy: 2,
      bedsCount: 1,
      sizeSqFt: 360,
      amenities: ['King Bed', 'Work Desk', 'Espresso Maker', 'Rain Shower', 'High-Speed Wi-Fi', 'Safe'],
    },
    {
      code: 'SUP_DBL',
      name: 'Superior Double',
      basePrice: 3600.0,
      maxOccupancy: 2,
      bedsCount: 2,
      sizeSqFt: 310,
      amenities: ['Twin Beds', 'High-Speed Wi-Fi', 'Mini Refrigerator', 'Coffee Maker', 'Walk-in Shower'],
    },
    {
      code: 'PRS_STE',
      name: 'Presidential Suite',
      basePrice: 14500.0,
      maxOccupancy: 4,
      bedsCount: 2,
      sizeSqFt: 950,
      amenities: ['Master Bedroom', 'Private Lounge', 'Dining Area', 'Jacuzzi', 'Butler Service', 'Panoramic View'],
    },
  ];

  const roomTypes: Record<string, any> = {};
  for (const rt of roomTypesData) {
    const created = await prisma.roomType.upsert({
      where: { hotelId_code: { hotelId: hotel.id, code: rt.code } },
      update: {},
      create: {
        hotelId: hotel.id,
        name: rt.name,
        code: rt.code,
        basePrice: rt.basePrice,
        maxOccupancy: rt.maxOccupancy,
        bedsCount: rt.bedsCount,
        sizeSqFt: rt.sizeSqFt,
        amenities: rt.amenities,
      },
    });
    roomTypes[rt.code] = created;
  }

  // 8. Rooms
  const roomsData = [
    // Floor 1 (Superior Double)
    { roomNumber: '101', floor: 1, roomTypeCode: 'SUP_DBL', status: RoomStatus.AVAILABLE, hk: HousekeepingStatus.CLEAN },
    { roomNumber: '102', floor: 1, roomTypeCode: 'SUP_DBL', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.CLEAN },
    { roomNumber: '103', floor: 1, roomTypeCode: 'SUP_DBL', status: RoomStatus.AVAILABLE, hk: HousekeepingStatus.DIRTY },
    { roomNumber: '104', floor: 1, roomTypeCode: 'SUP_DBL', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.CLEAN },
    { roomNumber: '105', floor: 1, roomTypeCode: 'SUP_DBL', status: RoomStatus.OUT_OF_SERVICE, hk: HousekeepingStatus.INSPECTION_REQUIRED, maint: MaintenanceStatus.UNDER_MAINTENANCE },

    // Floor 2 (Executive King)
    { roomNumber: '201', floor: 2, roomTypeCode: 'EXE_KNG', status: RoomStatus.AVAILABLE, hk: HousekeepingStatus.CLEAN },
    { roomNumber: '202', floor: 2, roomTypeCode: 'EXE_KNG', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.CLEAN },
    { roomNumber: '203', floor: 2, roomTypeCode: 'EXE_KNG', status: RoomStatus.AVAILABLE, hk: HousekeepingStatus.CLEANING_IN_PROGRESS },
    { roomNumber: '204', floor: 2, roomTypeCode: 'EXE_KNG', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.CLEAN },
    { roomNumber: '205', floor: 2, roomTypeCode: 'EXE_KNG', status: RoomStatus.AVAILABLE, hk: HousekeepingStatus.CLEAN },

    // Floor 3 (Deluxe Suite)
    { roomNumber: '301', floor: 3, roomTypeCode: 'DLX_STE', status: RoomStatus.AVAILABLE, hk: HousekeepingStatus.CLEAN },
    { roomNumber: '302', floor: 3, roomTypeCode: 'DLX_STE', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.CLEAN },
    { roomNumber: '303', floor: 3, roomTypeCode: 'DLX_STE', status: RoomStatus.AVAILABLE, hk: HousekeepingStatus.CLEAN },
    { roomNumber: '304', floor: 3, roomTypeCode: 'DLX_STE', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.CLEAN },
    { roomNumber: '305', floor: 3, roomTypeCode: 'DLX_STE', status: RoomStatus.AVAILABLE, hk: HousekeepingStatus.DIRTY },

    // Floor 4 (Presidential Suite)
    { roomNumber: '401', floor: 4, roomTypeCode: 'PRS_STE', status: RoomStatus.OCCUPIED, hk: HousekeepingStatus.CLEAN },
    { roomNumber: '402', floor: 4, roomTypeCode: 'PRS_STE', status: RoomStatus.AVAILABLE, hk: HousekeepingStatus.CLEAN },
  ];

  const rooms: Record<string, any> = {};
  for (const r of roomsData) {
    const created = await prisma.room.upsert({
      where: { hotelId_roomNumber: { hotelId: hotel.id, roomNumber: r.roomNumber } },
      update: {},
      create: {
        hotelId: hotel.id,
        roomNumber: r.roomNumber,
        floor: r.floor,
        roomTypeId: roomTypes[r.roomTypeCode].id,
        status: r.status,
        housekeepingStatus: r.hk,
        maintenanceStatus: r.maint || MaintenanceStatus.OPERATIONAL,
      },
    });
    rooms[r.roomNumber] = created;
  }

  // 9. Charge Categories & Service Items
  const catRoom = await prisma.chargeCategory.upsert({
    where: { hotelId_code: { hotelId: hotel.id, code: 'ROOM' } },
    update: {},
    create: { hotelId: hotel.id, name: 'Room Nightly Tariff', code: 'ROOM', taxRatePercent: 12.0 },
  });

  const catFB = await prisma.chargeCategory.upsert({
    where: { hotelId_code: { hotelId: hotel.id, code: 'FOOD_BEVERAGE' } },
    update: {},
    create: { hotelId: hotel.id, name: 'Food & Dining', code: 'FOOD_BEVERAGE', taxRatePercent: 5.0 },
  });

  const catBar = await prisma.chargeCategory.upsert({
    where: { hotelId_code: { hotelId: hotel.id, code: 'BAR' } },
    update: {},
    create: { hotelId: hotel.id, name: 'Bar & Spirits', code: 'BAR', taxRatePercent: 18.0 },
  });

  const catLaundry = await prisma.chargeCategory.upsert({
    where: { hotelId_code: { hotelId: hotel.id, code: 'LAUNDRY' } },
    update: {},
    create: { hotelId: hotel.id, name: 'Laundry Services', code: 'LAUNDRY', taxRatePercent: 12.0 },
  });

  const catTransport = await prisma.chargeCategory.upsert({
    where: { hotelId_code: { hotelId: hotel.id, code: 'TRANSPORT' } },
    update: {},
    create: { hotelId: hotel.id, name: 'Airport & City Travel', code: 'TRANSPORT', taxRatePercent: 5.0 },
  });

  const catSpa = await prisma.chargeCategory.upsert({
    where: { hotelId_code: { hotelId: hotel.id, code: 'SPA' } },
    update: {},
    create: { hotelId: hotel.id, name: 'Spa & Wellness', code: 'SPA', taxRatePercent: 18.0 },
  });

  // Service Items
  const items = [
    { cat: catFB, name: 'Rivanta Royal Breakfast Buffet', price: 750, sku: 'FB-001', tax: 5, alcohol: false },
    { cat: catFB, name: 'Chicken Biryani with Raita', price: 550, sku: 'FB-002', tax: 5, alcohol: false },
    { cat: catFB, name: 'Paneer Butter Masala & Naan', price: 480, sku: 'FB-003', tax: 5, alcohol: false },
    { cat: catFB, name: 'Artisan Espresso / Cappuccino', price: 220, sku: 'FB-004', tax: 5, alcohol: false },
    { cat: catBar, name: 'Glenfiddich 12 Yrs (30ml)', price: 650, sku: 'BAR-001', tax: 18, alcohol: true },
    { cat: catBar, name: 'Signature Mumbai Mule Cocktail', price: 520, sku: 'BAR-002', tax: 18, alcohol: true },
    { cat: catBar, name: 'Kingfisher Ultra Draught Beer', price: 380, sku: 'BAR-003', tax: 18, alcohol: true },
    { cat: catLaundry, name: 'Executive Suit Dry Clean', price: 450, sku: 'LND-001', tax: 12, alcohol: false },
    { cat: catLaundry, name: 'Shirt Steam Pressing', price: 150, sku: 'LND-002', tax: 12, alcohol: false },
    { cat: catTransport, name: 'Airport Chauffeur Transfer (Sedan)', price: 1800, sku: 'TRN-001', tax: 5, alcohol: false },
    { cat: catSpa, name: 'Aromatherapy Full Body Massage 60m', price: 2800, sku: 'SPA-001', tax: 18, alcohol: false },
  ];

  for (const it of items) {
    await prisma.serviceItem.create({
      data: {
        hotelId: hotel.id,
        categoryId: it.cat.id,
        name: it.name,
        unitPrice: it.price,
        sku: it.sku,
        taxPercent: it.tax,
        isAlcohol: it.alcohol,
      },
    });
  }

  // 10. Sample Active Stays & Guests
  const guest1 = await prisma.guest.create({
    data: {
      hotelId: hotel.id,
      fullName: 'Aarav Mehta',
      phone: '+91 98201 11222',
      email: 'aarav.mehta@techcorp.in',
      address: 'Penthouse 12, Hiranandani Gardens',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400076',
      country: 'India',
      nationality: 'Indian',
      idType: IdDocumentType.AADHAAR,
      idNumber: '••••-••••-8921',
      emergencyContactName: 'Ritu Mehta',
      emergencyContactPhone: '+91 98201 99887',
      isVip: true,
      notes: 'High-tier corporate client, prefers high floors',
    },
  });

  const now = new Date();
  const checkInDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
  const checkOutDate = new Date(now.getTime() + 48 * 60 * 60 * 1000); // in 2 days

  const stay1 = await prisma.stay.create({
    data: {
      hotelId: hotel.id,
      guestId: guest1.id,
      roomId: rooms['302'].id,
      bookingSourceId: bookingSources['MMT'].id,
      stayNumber: 'STY-2026-0001',
      checkInTime: checkInDate,
      expectedCheckOutTime: checkOutDate,
      adultsCount: 2,
      childrenCount: 0,
      totalNights: 3,
      ratePerNight: 6500.0,
      status: StayStatus.ACTIVE,
      externalBookingRef: 'MMT-894129',
      partnerCommissionAmount: 2925.0,
      partnerCommissionStatus: 'PENDING',
      partnerCollectedAmount: 19500.0,
      paymentResponsibility: 'PARTNER',
      specialRequests: 'Extra pillows and early morning newspaper',
      staffNotes: 'Guest checked in at front desk smoothly',
      createdByUserId: receptionistUser.id,
    },
  });

  // Guest signature for stay 1
  await prisma.guestDeclarationAcceptance.create({
    data: {
      stayId: stay1.id,
      guestId: guest1.id,
      declarationVersionId: declaration.id,
      accepted: true,
      signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10 90 40 T 170 30" stroke="%23172554" stroke-width="2" fill="none"/></svg>',
      signedByStaffId: receptionistUser.id,
    },
  });

  // Room charges for stay 1
  await prisma.stayCharge.create({
    data: {
      stayId: stay1.id,
      categoryId: catRoom.id,
      description: 'Deluxe Suite Night Tariff (3 nights @ ₹6,500)',
      quantity: 3,
      unitPrice: 6500.0,
      taxPercent: 12.0,
      taxAmount: 2340.0,
      discountAmount: 0.0,
      totalAmount: 21840.0,
      createdByUserId: receptionistUser.id,
    },
  });

  // Food charge for stay 1
  await prisma.stayCharge.create({
    data: {
      stayId: stay1.id,
      categoryId: catFB.id,
      description: 'In-Room Dining: Chicken Biryani & Artisan Coffee',
      quantity: 1,
      unitPrice: 770.0,
      taxPercent: 5.0,
      taxAmount: 38.5,
      discountAmount: 0.0,
      totalAmount: 808.5,
      orderReference: 'ORD-1092',
      createdByUserId: receptionistUser.id,
    },
  });

  // Payment for stay 1 (Advance)
  await prisma.payment.create({
    data: {
      hotelId: hotel.id,
      stayId: stay1.id,
      paymentNumber: 'PAY-2026-0001',
      amount: 10000.0,
      paymentMethod: PaymentMethod.CARD,
      paymentType: PaymentType.ADVANCE,
      status: PaymentStatus.SUCCESS,
      transactionReference: 'TXN-HDFC-99120',
      notes: 'Advance credit card payment captured at check-in',
      receivedByUserId: receptionistUser.id,
    },
  });

  // Guest 2 (Departure expected today)
  const guest2 = await prisma.guest.create({
    data: {
      hotelId: hotel.id,
      fullName: 'Sarah Jenkins',
      phone: '+44 7700 900123',
      email: 'sarah.jenkins@londonconsult.co.uk',
      address: '22 Baker Mews, Marylebone',
      city: 'London',
      state: 'Greater London',
      postalCode: 'W1U 3BW',
      country: 'United Kingdom',
      nationality: 'British',
      idType: IdDocumentType.PASSPORT,
      idNumber: 'GB-••••-4190',
      emergencyContactName: 'Mark Jenkins',
      emergencyContactPhone: '+44 7700 900999',
      isVip: false,
    },
  });

  const checkInDate2 = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 2 days ago
  const checkOutDate2 = new Date(now.getTime() + 2 * 60 * 60 * 1000); // in 2 hours (today's departure)

  const stay2 = await prisma.stay.create({
    data: {
      hotelId: hotel.id,
      guestId: guest2.id,
      roomId: rooms['202'].id,
      bookingSourceId: bookingSources['BOOKING_COM'].id,
      stayNumber: 'STY-2026-0002',
      checkInTime: checkInDate2,
      expectedCheckOutTime: checkOutDate2,
      adultsCount: 1,
      childrenCount: 0,
      totalNights: 2,
      ratePerNight: 4800.0,
      status: StayStatus.ACTIVE,
      externalBookingRef: 'BK-552190',
      createdByUserId: receptionistUser.id,
    },
  });

  await prisma.stayCharge.create({
    data: {
      stayId: stay2.id,
      categoryId: catRoom.id,
      description: 'Executive King Night Tariff (2 nights @ ₹4,800)',
      quantity: 2,
      unitPrice: 4800.0,
      taxPercent: 12.0,
      taxAmount: 1152.0,
      discountAmount: 0.0,
      totalAmount: 10752.0,
      createdByUserId: receptionistUser.id,
    },
  });

  await prisma.stayCharge.create({
    data: {
      stayId: stay2.id,
      categoryId: catTransport.id,
      description: 'Airport Chauffeur Transfer (Sedan)',
      quantity: 1,
      unitPrice: 1800.0,
      taxPercent: 5.0,
      taxAmount: 90.0,
      discountAmount: 0.0,
      totalAmount: 1890.0,
      createdByUserId: receptionistUser.id,
    },
  });

  await prisma.payment.create({
    data: {
      hotelId: hotel.id,
      stayId: stay2.id,
      paymentNumber: 'PAY-2026-0002',
      amount: 10000.0,
      paymentMethod: PaymentMethod.UPI,
      paymentType: PaymentType.PARTIAL,
      status: PaymentStatus.SUCCESS,
      transactionReference: 'UPI-SBIN-882103',
      notes: 'UPI payment at front desk',
      receivedByUserId: receptionistUser.id,
    },
  });

  // Housekeeping task
  await prisma.housekeepingTask.create({
    data: {
      hotelId: hotel.id,
      roomId: rooms['103'].id,
      taskType: 'TURNOVER',
      status: 'PENDING',
      priority: 'HIGH',
      notes: 'Room vacated; linen change and sanitization required',
      assignedToUserId: housekeepingUser.id,
    },
  });

  // Maintenance issue
  await prisma.maintenanceIssue.create({
    data: {
      hotelId: hotel.id,
      roomId: rooms['105'].id,
      reportedByUserId: housekeepingUser.id,
      title: 'AC Thermostat erratic cooling',
      description: 'Thermostat displaying error code E3 and compressor cutting off',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      resolutionNotes: 'HVAC technician scheduled for afternoon inspection',
    },
  });

  // Audit log entries
  await prisma.auditLog.create({
    data: {
      hotelId: hotel.id,
      userId: adminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'HOTEL',
      entityId: hotel.id,
      details: { message: 'Rivanta Hotel Management System database seeded and initialized successfully' },
    },
  });

  await prisma.auditLog.create({
    data: {
      hotelId: hotel.id,
      userId: receptionistUser.id,
      action: 'GUEST_CHECK_IN',
      entityType: 'STAY',
      entityId: stay1.id,
      details: { guestName: 'Aarav Mehta', roomNumber: '302', stayNumber: 'STY-2026-0001' },
    },
  });

  console.log('✅ Seed completed successfully with live hotel records, rooms, booking sources, and initial stays!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
