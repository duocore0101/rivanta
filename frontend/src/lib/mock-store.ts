// In-Memory & LocalStorage persistent Mock Data Store for Rivanta HMS
// Provides 100% exact feature fidelity without requiring an external PostgreSQL instance.

export interface MockGuest {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  isVip?: boolean;
  email: string;
  phone: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  country: string;
  idType: string;
  idNumber: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface MockRoomType {
  id: string;
  name: string;
  code: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  amenities: string[];
  totalRooms: number;
}

export interface MockRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  roomType: MockRoomType;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  housekeepingStatus: 'CLEAN' | 'INSPECTED' | 'DIRTY' | 'IN_PROGRESS';
  currentStayId?: string | null;
  currentStay?: any;
}

export interface MockCharge {
  id: string;
  stayId: string;
  category: 'ROOM' | 'FOOD_BEVERAGE' | 'BAR' | 'LAUNDRY' | 'SPA' | 'TRANSPORT' | 'MINIBAR' | 'MISC';
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  isVoid: boolean;
  voidReason?: string;
  postedAt: string;
}

export interface MockPayment {
  id: string;
  stayId: string;
  invoiceId?: string;
  amount: number;
  method: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';
  transactionRef: string;
  status: 'COMPLETED' | 'REFUNDED' | 'VOIDED';
  notes?: string;
  createdAt: string;
}

export interface MockStay {
  id: string;
  stayNumber: string;
  guestId: string;
  guest: MockGuest;
  roomId: string;
  room: MockRoom;
  checkInDate: string;
  checkOutDate: string;
  actualCheckIn: string;
  actualCheckOut?: string;
  nights: number;
  totalNights?: number;
  adults: number;
  children: number;
  status: 'ACTIVE' | 'CHECKED_OUT' | 'RESERVED' | 'CANCELLED';
  ratePerNight: number;
  bookingSource: any;
  bookingRef?: string;
  specialRequests?: string;
  signatureUrl?: string;
  charges: MockCharge[];
  payments: MockPayment[];
  invoices: any[];
  totalCharges: number;
  totalPayments: number;
  outstandingBalance: number;
  financials?: {
    totalCharges: number;
    totalPayments: number;
    outstandingBalance: number;
  };
  createdAt: string;
}

export interface MockHousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  taskType: 'CLEAN' | 'INSPECT' | 'DEEP_CLEAN' | 'TURNOVER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTo?: string;
  notes?: string;
  createdAt: string;
}

export interface MockAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorEmail: string;
  actorRole: string;
  details: string;
  timestamp: string;
}

// Initial seed data
const INITIAL_ROOM_TYPES: MockRoomType[] = [
  {
    id: 'rt-1',
    name: 'Deluxe Heritage Room',
    code: 'DHR',
    description: 'Elegantly appointed heritage room with carved teakwood furniture and courtyard views.',
    basePrice: 4500,
    maxOccupancy: 2,
    amenities: ['King Bed', 'High-speed Wi-Fi', 'Courtyard View', 'Rain Shower', 'Complimentary Breakfast'],
    totalRooms: 5,
  },
  {
    id: 'rt-2',
    name: 'Executive Palace Suite',
    code: 'EPS',
    description: 'Spacious palace suite with separate living parlor, marble bathroom, and garden veranda.',
    basePrice: 8500,
    maxOccupancy: 3,
    amenities: ['King Bed + Sofa Bed', 'Veranda', 'Espresso Machine', 'Bathtub & Shower', 'Butler Service'],
    totalRooms: 5,
  },
  {
    id: 'rt-3',
    name: 'Royal Maharajah Suite',
    code: 'RMS',
    description: 'Opulent suite inspired by royal Rajput craftsmanship, featuring private jacuzzi and grand terrace.',
    basePrice: 16000,
    maxOccupancy: 4,
    amenities: ['Royal Canopy Bed', 'Private Jacuzzi', 'Terrace', 'Personal Concierge', 'Complimentary Bar'],
    totalRooms: 4,
  },
  {
    id: 'rt-4',
    name: 'Presidential Penthouse',
    code: 'PPH',
    description: 'The pinnacle of luxury. Private plunge pool, master dining room, and panoramic palace views.',
    basePrice: 28000,
    maxOccupancy: 4,
    amenities: ['Private Plunge Pool', 'Chef Kitchen', 'Panoramic Deck', 'Chauffeur Transfer', 'VIP Lounge'],
    totalRooms: 3,
  },
];

const INITIAL_ROOMS: MockRoom[] = [
  // 1st Floor
  { id: 'r-101', roomNumber: '101', floor: 1, roomTypeId: 'rt-1', roomType: INITIAL_ROOM_TYPES[0], status: 'OCCUPIED', housekeepingStatus: 'CLEAN' },
  { id: 'r-102', roomNumber: '102', floor: 1, roomTypeId: 'rt-1', roomType: INITIAL_ROOM_TYPES[0], status: 'AVAILABLE', housekeepingStatus: 'CLEAN' },
  { id: 'r-103', roomNumber: '103', floor: 1, roomTypeId: 'rt-1', roomType: INITIAL_ROOM_TYPES[0], status: 'AVAILABLE', housekeepingStatus: 'DIRTY' },
  { id: 'r-104', roomNumber: '104', floor: 1, roomTypeId: 'rt-1', roomType: INITIAL_ROOM_TYPES[0], status: 'MAINTENANCE', housekeepingStatus: 'IN_PROGRESS' },
  { id: 'r-105', roomNumber: '105', floor: 1, roomTypeId: 'rt-1', roomType: INITIAL_ROOM_TYPES[0], status: 'AVAILABLE', housekeepingStatus: 'INSPECTED' },
  // 2nd Floor
  { id: 'r-201', roomNumber: '201', floor: 2, roomTypeId: 'rt-2', roomType: INITIAL_ROOM_TYPES[1], status: 'OCCUPIED', housekeepingStatus: 'CLEAN' },
  { id: 'r-202', roomNumber: '202', floor: 2, roomTypeId: 'rt-2', roomType: INITIAL_ROOM_TYPES[1], status: 'AVAILABLE', housekeepingStatus: 'CLEAN' },
  { id: 'r-203', roomNumber: '203', floor: 2, roomTypeId: 'rt-2', roomType: INITIAL_ROOM_TYPES[1], status: 'AVAILABLE', housekeepingStatus: 'CLEAN' },
  { id: 'r-204', roomNumber: '204', floor: 2, roomTypeId: 'rt-2', roomType: INITIAL_ROOM_TYPES[1], status: 'RESERVED', housekeepingStatus: 'CLEAN' },
  { id: 'r-205', roomNumber: '205', floor: 2, roomTypeId: 'rt-2', roomType: INITIAL_ROOM_TYPES[1], status: 'AVAILABLE', housekeepingStatus: 'INSPECTED' },
  // 3rd Floor
  { id: 'r-301', roomNumber: '301', floor: 3, roomTypeId: 'rt-3', roomType: INITIAL_ROOM_TYPES[2], status: 'OCCUPIED', housekeepingStatus: 'CLEAN' },
  { id: 'r-302', roomNumber: '302', floor: 3, roomTypeId: 'rt-3', roomType: INITIAL_ROOM_TYPES[2], status: 'AVAILABLE', housekeepingStatus: 'CLEAN' },
  { id: 'r-303', roomNumber: '303', floor: 3, roomTypeId: 'rt-3', roomType: INITIAL_ROOM_TYPES[2], status: 'AVAILABLE', housekeepingStatus: 'DIRTY' },
  { id: 'r-304', roomNumber: '304', floor: 3, roomTypeId: 'rt-3', roomType: INITIAL_ROOM_TYPES[2], status: 'AVAILABLE', housekeepingStatus: 'CLEAN' },
  // 4th Floor
  { id: 'r-401', roomNumber: '401', floor: 4, roomTypeId: 'rt-4', roomType: INITIAL_ROOM_TYPES[3], status: 'AVAILABLE', housekeepingStatus: 'INSPECTED' },
  { id: 'r-402', roomNumber: '402', floor: 4, roomTypeId: 'rt-4', roomType: INITIAL_ROOM_TYPES[3], status: 'AVAILABLE', housekeepingStatus: 'CLEAN' },
  { id: 'r-403', roomNumber: '403', floor: 4, roomTypeId: 'rt-4', roomType: INITIAL_ROOM_TYPES[3], status: 'OUT_OF_SERVICE', housekeepingStatus: 'DIRTY' },
];

const INITIAL_GUESTS: MockGuest[] = [
  {
    id: 'g-1',
    firstName: 'Vikram',
    lastName: 'Malhotra',
    fullName: 'Vikram Malhotra',
    isVip: true,
    email: 'vikram.m@corporatemail.com',
    phone: '+91 98201 12345',
    nationality: 'Indian',
    address: '42 Marine Drive, Nariman Point',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    idType: 'PASSPORT',
    idNumber: 'Z9876543',
    createdAt: '2026-10-09T10:00:00Z',
  },
  {
    id: 'g-2',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    fullName: 'Sarah Jenkins',
    isVip: true,
    email: 'sarah.j@california.org',
    phone: '+1 415 555 2671',
    nationality: 'American',
    address: '880 Montgomery Street',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    idType: 'PASSPORT',
    idNumber: 'US12345678',
    createdAt: '2026-10-10T11:00:00Z',
  },
  {
    id: 'g-3',
    firstName: 'Priya',
    lastName: 'Sharma',
    fullName: 'Priya Sharma',
    isVip: false,
    email: 'priya.sharma@delhicapital.in',
    phone: '+91 98110 54321',
    nationality: 'Indian',
    address: '14 Vasant Vihar, Block C',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    idType: 'AADHAAR',
    idNumber: '4321-8765-2109',
    createdAt: '2026-10-11T08:30:00Z',
  },
  {
    id: 'g-4',
    firstName: 'David',
    lastName: 'Wilson',
    fullName: 'David Wilson',
    isVip: false,
    email: 'david.wilson@ukglobal.co.uk',
    phone: '+44 7700 900123',
    nationality: 'British',
    address: '12 Kensington High Street',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    idType: 'PASSPORT',
    idNumber: 'GB9876541',
    createdAt: '2026-10-08T14:00:00Z',
  },
];

const INITIAL_STAYS: MockStay[] = [
  {
    id: 'stay-1',
    stayNumber: 'RIV-2026-00101',
    guestId: 'g-1',
    guest: INITIAL_GUESTS[0],
    roomId: 'r-201',
    room: INITIAL_ROOMS.find((r) => r.id === 'r-201')!,
    checkInDate: '2026-10-09T14:00:00Z',
    checkOutDate: '2026-10-12T11:00:00Z',
    actualCheckIn: '2026-10-09T14:30:00Z',
    nights: 3,
    totalNights: 3,
    adults: 2,
    children: 0,
    status: 'ACTIVE',
    ratePerNight: 8500,
    bookingSource: { id: 'bs-mmt', name: 'MakeMyTrip' },
    bookingRef: 'MMT-88492019',
    specialRequests: 'High floor, extra feather pillows, late checkout requested.',
    signatureUrl: 'data:image/png;base64,mockSignatureData',
    charges: [
      {
        id: 'c-1',
        stayId: 'stay-1',
        category: 'ROOM',
        description: 'Room Charge - Executive Palace Suite (3 nights @ ₹8,500)',
        quantity: 3,
        unitPrice: 8500,
        taxRate: 18,
        taxAmount: 4590,
        totalAmount: 30090,
        isVoid: false,
        postedAt: '2026-10-09T14:30:00Z',
      },
      {
        id: 'c-2',
        stayId: 'stay-1',
        category: 'FOOD_BEVERAGE',
        description: 'In-Room Dining: Royal Rajasthani Thali (x2)',
        quantity: 2,
        unitPrice: 1200,
        taxRate: 18,
        taxAmount: 432,
        totalAmount: 2832,
        isVoid: false,
        postedAt: '2026-10-09T20:45:00Z',
      },
      {
        id: 'c-3',
        stayId: 'stay-1',
        category: 'TRANSPORT',
        description: 'Airport Luxury Sedan Drop-off Transfer',
        quantity: 1,
        unitPrice: 2200,
        taxRate: 18,
        taxAmount: 396,
        totalAmount: 2596,
        isVoid: false,
        postedAt: '2026-10-10T11:20:00Z',
      },
    ],
    payments: [
      {
        id: 'p-1',
        stayId: 'stay-1',
        amount: 15000,
        method: 'CARD',
        transactionRef: 'HDFC-TXN-998811',
        status: 'COMPLETED',
        notes: 'Advance deposit paid at check-in',
        createdAt: '2026-10-09T14:30:00Z',
      },
    ],
    invoices: [],
    totalCharges: 35518,
    totalPayments: 15000,
    outstandingBalance: 20518,
    financials: {
      totalCharges: 35518,
      totalPayments: 15000,
      outstandingBalance: 20518,
    },
    createdAt: '2026-10-09T14:30:00Z',
  },
  {
    id: 'stay-2',
    stayNumber: 'RIV-2026-00102',
    guestId: 'g-2',
    guest: INITIAL_GUESTS[1],
    roomId: 'r-301',
    room: INITIAL_ROOMS.find((r) => r.id === 'r-301')!,
    checkInDate: '2026-10-10T15:00:00Z',
    checkOutDate: '2026-10-13T11:00:00Z',
    actualCheckIn: '2026-10-10T15:15:00Z',
    nights: 3,
    totalNights: 3,
    adults: 2,
    children: 1,
    status: 'ACTIVE',
    ratePerNight: 16000,
    bookingSource: { id: 'bs-bk', name: 'Booking.com' },
    bookingRef: 'BK-33948102',
    specialRequests: 'Courtyard candlelit dinner setup, vegan breakfast.',
    signatureUrl: 'data:image/png;base64,mockSignatureData',
    charges: [
      {
        id: 'c-4',
        stayId: 'stay-2',
        category: 'ROOM',
        description: 'Room Charge - Royal Maharajah Suite (3 nights @ ₹16,000)',
        quantity: 3,
        unitPrice: 16000,
        taxRate: 18,
        taxAmount: 8640,
        totalAmount: 56640,
        isVoid: false,
        postedAt: '2026-10-10T15:15:00Z',
      },
      {
        id: 'c-5',
        stayId: 'stay-2',
        category: 'SPA',
        description: 'Ayurvedic Abhyanga Massage 60m',
        quantity: 1,
        unitPrice: 3500,
        taxRate: 18,
        taxAmount: 630,
        totalAmount: 4130,
        isVoid: false,
        postedAt: '2026-10-11T10:00:00Z',
      },
      {
        id: 'c-6',
        stayId: 'stay-2',
        category: 'BAR',
        description: 'Sula Dindori Reserve Red Wine Glass (x2)',
        quantity: 2,
        unitPrice: 650,
        taxRate: 18,
        taxAmount: 234,
        totalAmount: 1534,
        isVoid: false,
        postedAt: '2026-10-10T21:30:00Z',
      },
    ],
    payments: [
      {
        id: 'p-2',
        stayId: 'stay-2',
        amount: 30000,
        method: 'UPI',
        transactionRef: 'UPI-RAZOR-88331',
        status: 'COMPLETED',
        notes: 'Pre-authorization settlement',
        createdAt: '2026-10-10T15:15:00Z',
      },
    ],
    invoices: [],
    totalCharges: 62304,
    totalPayments: 30000,
    outstandingBalance: 32304,
    financials: {
      totalCharges: 62304,
      totalPayments: 30000,
      outstandingBalance: 32304,
    },
    createdAt: '2026-10-10T15:15:00Z',
  },
  {
    id: 'stay-3',
    stayNumber: 'RIV-2026-00103',
    guestId: 'g-3',
    guest: INITIAL_GUESTS[2],
    roomId: 'r-101',
    room: INITIAL_ROOMS.find((r) => r.id === 'r-101')!,
    checkInDate: '2026-10-11T09:00:00Z',
    checkOutDate: '2026-10-12T11:00:00Z',
    actualCheckIn: '2026-10-11T09:10:00Z',
    nights: 1,
    totalNights: 1,
    adults: 1,
    children: 0,
    status: 'ACTIVE',
    ratePerNight: 4500,
    bookingSource: { id: 'bs-walkin', name: 'Walk-in' },
    specialRequests: 'Quiet room away from elevators',
    signatureUrl: 'data:image/png;base64,mockSignatureData',
    charges: [
      {
        id: 'c-7',
        stayId: 'stay-3',
        category: 'ROOM',
        description: 'Room Charge - Deluxe Heritage Room (1 night @ ₹4,500)',
        quantity: 1,
        unitPrice: 4500,
        taxRate: 12,
        taxAmount: 540,
        totalAmount: 5040,
        isVoid: false,
        postedAt: '2026-10-11T09:10:00Z',
      },
    ],
    payments: [
      {
        id: 'p-3',
        stayId: 'stay-3',
        amount: 5040,
        method: 'CASH',
        transactionRef: 'CASH-REC-1092',
        status: 'COMPLETED',
        notes: 'Full payment received at walk-in check-in',
        createdAt: '2026-10-11T09:10:00Z',
      },
    ],
    invoices: [],
    totalCharges: 5040,
    totalPayments: 5040,
    outstandingBalance: 0,
    financials: {
      totalCharges: 5040,
      totalPayments: 5040,
      outstandingBalance: 0,
    },
    createdAt: '2026-10-11T09:10:00Z',
  },
  {
    id: 'stay-4',
    stayNumber: 'RIV-2026-00099',
    guestId: 'g-4',
    guest: INITIAL_GUESTS[3],
    roomId: 'r-102',
    room: INITIAL_ROOMS.find((r) => r.id === 'r-102')!,
    checkInDate: '2026-10-09T12:00:00Z',
    checkOutDate: '2026-10-11T11:00:00Z',
    actualCheckIn: '2026-10-09T12:15:00Z',
    actualCheckOut: '2026-10-11T10:30:00Z',
    nights: 2,
    totalNights: 2,
    adults: 2,
    children: 0,
    status: 'CHECKED_OUT',
    ratePerNight: 4500,
    bookingSource: { id: 'bs-agoda', name: 'Agoda' },
    bookingRef: 'AG-993817',
    charges: [
      {
        id: 'c-8',
        stayId: 'stay-4',
        category: 'ROOM',
        description: 'Room Charge - Deluxe Heritage Room (2 nights @ ₹4,500)',
        quantity: 2,
        unitPrice: 4500,
        taxRate: 12,
        taxAmount: 1080,
        totalAmount: 10080,
        isVoid: false,
        postedAt: '2026-10-09T12:15:00Z',
      },
    ],
    payments: [
      {
        id: 'p-4',
        stayId: 'stay-4',
        amount: 10080,
        method: 'CARD',
        transactionRef: 'AMEX-882190',
        status: 'COMPLETED',
        createdAt: '2026-10-11T10:25:00Z',
      },
    ],
    invoices: [
      {
        id: 'inv-1',
        invoiceNumber: 'RIV-2026-0001',
        stayId: 'stay-4',
        guestName: 'David Wilson',
        roomNumber: '102',
        subtotal: 9000,
        taxTotal: 1080,
        grandTotal: 10080,
        paidAmount: 10080,
        status: 'FINAL',
        issuedAt: '2026-10-11T10:25:00Z',
      },
    ],
    totalCharges: 10080,
    totalPayments: 10080,
    outstandingBalance: 0,
    financials: {
      totalCharges: 10080,
      totalPayments: 10080,
      outstandingBalance: 0,
    },
    createdAt: '2026-10-09T12:15:00Z',
  },
];

const INITIAL_HOUSEKEEPING: MockHousekeepingTask[] = [
  {
    id: 'hk-1',
    roomId: 'r-103',
    roomNumber: '103',
    roomType: 'Deluxe Heritage Room',
    taskType: 'TURNOVER',
    priority: 'HIGH',
    status: 'PENDING',
    notes: 'Departure turnover - bed linen change and full sanitization',
    createdAt: '2026-10-11T07:00:00Z',
  },
  {
    id: 'hk-2',
    roomId: 'r-303',
    roomNumber: '303',
    roomType: 'Royal Maharajah Suite',
    taskType: 'DEEP_CLEAN',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedTo: 'Rajesh Kumar',
    notes: 'Jacuzzi descaling & marble polishing',
    createdAt: '2026-10-11T08:00:00Z',
  },
  {
    id: 'hk-3',
    roomId: 'r-104',
    roomNumber: '104',
    roomType: 'Deluxe Heritage Room',
    taskType: 'CLEAN',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedTo: 'Anita Devi',
    notes: 'Post-AC maintenance dust cleanup',
    createdAt: '2026-10-11T09:30:00Z',
  },
];

const INITIAL_AUDIT_LOGS: MockAuditLog[] = [
  {
    id: 'aud-1',
    action: 'CHECK_IN_COMPLETED',
    entityType: 'STAY',
    entityId: 'stay-3',
    actorEmail: 'receptionist@rivanta.com',
    actorRole: 'RECEPTIONIST',
    details: 'Guest Priya Sharma checked into Room 101. Advance cash ₹5,040 collected.',
    timestamp: '2026-10-11T09:10:00Z',
  },
  {
    id: 'aud-2',
    action: 'CHECK_OUT_COMPLETED',
    entityType: 'STAY',
    entityId: 'stay-4',
    actorEmail: 'receptionist@rivanta.com',
    actorRole: 'RECEPTIONIST',
    details: 'Guest David Wilson checked out from Room 102. Invoice RIV-2026-0001 finalized.',
    timestamp: '2026-10-11T10:30:00Z',
  },
  {
    id: 'aud-3',
    action: 'CHARGE_ADDED',
    entityType: 'STAY_CHARGE',
    entityId: 'c-5',
    actorEmail: 'receptionist@rivanta.com',
    actorRole: 'RECEPTIONIST',
    details: 'Ayurvedic Abhyanga Massage 60m posted to Stay RIV-2026-00102 (₹4,130).',
    timestamp: '2026-10-11T10:00:00Z',
  },
  {
    id: 'aud-4',
    action: 'ROOM_STATUS_CHANGED',
    entityType: 'ROOM',
    entityId: 'r-104',
    actorEmail: 'admin@rivanta.com',
    actorRole: 'ADMIN',
    details: 'Room 104 placed under MAINTENANCE for HVAC thermostat repair.',
    timestamp: '2026-10-11T08:15:00Z',
  },
];

// Helper to access and save state
class MockStoreService {
  private rooms: MockRoom[] = INITIAL_ROOMS;
  private roomTypes: MockRoomType[] = INITIAL_ROOM_TYPES;
  private guests: MockGuest[] = INITIAL_GUESTS;
  private stays: MockStay[] = INITIAL_STAYS;
  private housekeeping: MockHousekeepingTask[] = INITIAL_HOUSEKEEPING;
  private auditLogs: MockAuditLog[] = INITIAL_AUDIT_LOGS;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedRooms = localStorage.getItem('rivanta_mock_rooms');
        if (savedRooms) this.rooms = JSON.parse(savedRooms);
        const savedGuests = localStorage.getItem('rivanta_mock_guests');
        if (savedGuests) this.guests = JSON.parse(savedGuests);
        const savedStays = localStorage.getItem('rivanta_mock_stays');
        if (savedStays) this.stays = JSON.parse(savedStays);
        const savedHk = localStorage.getItem('rivanta_mock_hk');
        if (savedHk) this.housekeeping = JSON.parse(savedHk);
        const savedLogs = localStorage.getItem('rivanta_mock_logs');
        if (savedLogs) this.auditLogs = JSON.parse(savedLogs);
      } catch (e) {
        console.warn('Could not read from localStorage, using initial mock data', e);
      }
    }
    this.hydrate();
    this.save();
  }

  private hydrate() {
    this.rooms = this.rooms.map((r) => {
      const rt = (r.roomType && r.roomType.name)
        ? r.roomType
        : (this.roomTypes.find((t) => t.id === r.roomTypeId) || INITIAL_ROOM_TYPES[0]);
      return { ...r, roomType: rt };
    });

    this.guests = this.guests.map((g) => {
      const fullName = g.fullName || `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Guest';
      return { ...g, fullName };
    });

    this.stays = this.stays.map((s) => this.normalizeStay(s));
  }

  public normalizeStay(s: MockStay): MockStay {
    const room = this.rooms.find((r) => r.id === s.roomId) || s.room || INITIAL_ROOMS[0];
    const roomType = (room.roomType && room.roomType.name)
      ? room.roomType
      : (this.roomTypes.find((rt) => rt.id === (room.roomTypeId || s.roomId)) || INITIAL_ROOM_TYPES[0]);
    const hydratedRoom: MockRoom = {
      ...room,
      roomType,
    };

    const guest = this.guests.find((g) => g.id === s.guestId) || s.guest || INITIAL_GUESTS[0];
    const fullName = guest.fullName || `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || 'Guest';
    const hydratedGuest: MockGuest = {
      ...guest,
      fullName,
    };

    let bookingSource = s.bookingSource;
    if (typeof bookingSource === 'string') {
      bookingSource = { id: `bs-${bookingSource.toLowerCase().replace(/[^a-z0-9]/g, '')}`, name: bookingSource };
    } else if (!bookingSource || !bookingSource.name) {
      bookingSource = { id: 'bs-walkin', name: 'Walk-in' };
    }

    const totalCharges = s.charges?.reduce((acc, c) => acc + (c.isVoid ? 0 : Number(c.totalAmount || 0)), 0) ?? s.totalCharges ?? 0;
    const totalPayments = s.payments?.reduce((acc, p) => acc + (p.status === 'COMPLETED' || (p.status as string) === 'SUCCESS' ? Number(p.amount || 0) : 0), 0) ?? s.totalPayments ?? 0;
    const outstandingBalance = Math.max(0, totalCharges - totalPayments);

    return {
      ...s,
      room: hydratedRoom,
      guest: hydratedGuest,
      bookingSource,
      nights: s.nights || s.totalNights || 1,
      totalNights: s.totalNights || s.nights || 1,
      totalCharges,
      totalPayments,
      outstandingBalance,
      financials: {
        totalCharges,
        totalPayments,
        outstandingBalance,
      },
    };
  }

  private save() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rivanta_mock_rooms', JSON.stringify(this.rooms));
        localStorage.setItem('rivanta_mock_guests', JSON.stringify(this.guests));
        localStorage.setItem('rivanta_mock_stays', JSON.stringify(this.stays));
        localStorage.setItem('rivanta_mock_hk', JSON.stringify(this.housekeeping));
        localStorage.setItem('rivanta_mock_logs', JSON.stringify(this.auditLogs));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
  }

  public getHotelSettings() {
    return {
      hotel: {
        id: 'h-1',
        name: 'The Rivanta Palace & Suites',
        legalName: 'Rivanta Heritage Hospitality Pvt. Ltd.',
        address: 'Palace Road, Central Heritage Zone',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        postalCode: '302001',
        phone: '+91 141 289 0000',
        email: 'concierge@rivanta.com',
        website: 'https://rivanta.com',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      },
      taxes: [
        { id: 'tax-1', name: 'GST (Rooms <= ₹7,500)', rate: 12, code: 'GST_12', description: 'Standard Room GST' },
        { id: 'tax-2', name: 'Luxury GST (Rooms > ₹7,500 & Dining)', rate: 18, code: 'GST_18', description: 'Luxury Slab & Services GST' },
      ],
      declaration: {
        version: '1.2',
        title: 'Rivanta Guest Registration & House Rules Declaration',
        content: `1. Identity Verification: All guests must present valid government photo identification upon check-in. Non-Indian citizens must provide valid passport and Indian visa documentation.
2. Check-in & Checkout: Standard check-in time is 14:00 hrs and checkout time is 11:00 hrs. Late checkout is subject to room availability and applicable charges.
3. Non-Smoking Policy: The Rivanta Palace is a 100% non-smoking heritage property in all enclosed suites and indoor corridors. Designated smoking pavilions are provided in garden zones.
4. Valuables & Safety: The hotel provides in-room digital electronic safes. The management cannot be held liable for unsecured cash or valuables left unattended in public or guest areas.
5. Settlement of Charges: All incidentals, dining, bar, laundry, and transport charges must be settled in full prior to departure. Unpaid folios will be charged to the card on file.`,
      },
      notifications: {
        emailProvider: 'SMTP (Custom Mailgun / SendGrid)',
        emailConfigured: false,
        whatsappProvider: 'Meta Cloud WhatsApp Business API',
        whatsappConfigured: false,
      },
    };
  }

  public getRoomTypes() {
    return this.roomTypes;
  }

  public getRooms(status?: string) {
    const rooms = this.rooms.map((r) => {
      const rt = (r.roomType && r.roomType.name)
        ? r.roomType
        : (this.roomTypes.find((t) => t.id === r.roomTypeId) || INITIAL_ROOM_TYPES[0]);
      return { ...r, roomType: rt };
    });
    if (status && status !== 'ALL') {
      return rooms.filter((r) => r.status === status);
    }
    return rooms;
  }

  public getGuests(query?: string) {
    const list = this.guests.map((g) => ({
      ...g,
      fullName: g.fullName || `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Guest',
    }));
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(
      (g) =>
        g.fullName.toLowerCase().includes(q) ||
        g.firstName.toLowerCase().includes(q) ||
        g.lastName.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.idNumber.toLowerCase().includes(q)
    );
  }

  public getGuestById(id: string) {
    const guest = this.guests.find((g) => g.id === id);
    if (!guest) return null;
    const fullName = guest.fullName || `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || 'Guest';
    const stays = this.stays.filter((s) => s.guestId === id).map((s) => this.normalizeStay(s));
    return {
      ...guest,
      fullName,
      stays,
    };
  }

  public getStays(filter?: string) {
    let result = this.stays;
    if (filter === 'ARRIVALS_TODAY') {
      result = this.stays.filter((s) => s.status === 'ACTIVE' && s.checkInDate.startsWith('2026-10-11'));
    } else if (filter === 'DEPARTURES_TODAY') {
      result = this.stays.filter((s) => s.checkOutDate.startsWith('2026-10-11'));
    } else if (filter === 'IN_HOUSE' || filter === 'ACTIVE') {
      result = this.stays.filter((s) => s.status === 'ACTIVE');
    }
    return result.map((s) => this.normalizeStay(s));
  }

  public getStayById(id: string) {
    const s = this.stays.find((st) => st.id === id);
    return s ? this.normalizeStay(s) : null;
  }

  public checkIn(dto: any) {
    const guestInput = dto.guestData || dto.guest || {};
    const stayInput = dto.stayData || dto.stay || {};
    const bookingInput = dto.bookingSourceData || {};
    const advanceInput = dto.advancePayment;
    const signatureUrl = dto.signatureUrl || dto.declarationAcceptance?.signatureUrl || '';

    // 1. Create or match guest
    let guest = this.guests.find(
      (g) => (guestInput.phone && g.phone === guestInput.phone) || (guestInput.email && g.email === guestInput.email)
    );
    if (!guest) {
      guest = {
        id: `g-${Date.now()}`,
        firstName: guestInput.firstName || 'Guest',
        lastName: guestInput.lastName || '',
        email: guestInput.email || '',
        phone: guestInput.phone || '',
        nationality: guestInput.nationality || 'Indian',
        address: guestInput.address || '',
        city: guestInput.city || '',
        state: guestInput.state || '',
        country: guestInput.country || 'India',
        idType: guestInput.idType || 'AADHAAR',
        idNumber: guestInput.idNumber || '',
        emergencyContact: guestInput.emergencyContact || '',
        createdAt: new Date().toISOString(),
      };
      this.guests.unshift(guest);
    }

    // 2. Locate room
    const roomId = stayInput.roomId;
    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) throw new Error('Selected room was not found');
    if (room.status !== 'AVAILABLE') throw new Error(`Room ${room.roomNumber} is currently ${room.status}`);

    // 3. Calculate taxes and night charges
    const checkInDate = stayInput.checkInTime || stayInput.checkInDate || new Date().toISOString();
    const checkOutDate = stayInput.expectedCheckOutTime || stayInput.checkOutDate || new Date(Date.now() + 86400000).toISOString();
    const calculatedNights = Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)));
    const nights = Number(stayInput.nightsCount || stayInput.nights || calculatedNights);
    const ratePerNight = Number(stayInput.ratePerNight) || room.roomType.basePrice;
    const subtotal = ratePerNight * nights;
    const taxRate = ratePerNight > 7500 ? 18 : 12;
    const taxAmount = Math.round((subtotal * taxRate) / 100);
    const totalRoomCharge = subtotal + taxAmount;

    const stayId = `stay-${Date.now()}`;
    const initialCharges: MockCharge[] = [
      {
        id: `c-${Date.now()}`,
        stayId,
        category: 'ROOM',
        description: `Room Charge - ${room.roomType.name} (${nights} night${nights > 1 ? 's' : ''} @ ₹${ratePerNight.toLocaleString()})`,
        quantity: nights,
        unitPrice: ratePerNight,
        taxRate,
        taxAmount,
        totalAmount: totalRoomCharge,
        isVoid: false,
        postedAt: new Date().toISOString(),
      },
    ];

    const initialPayments: MockPayment[] = [];
    let advanceAmount = 0;
    if (advanceInput && Number(advanceInput.amount) > 0) {
      advanceAmount = Number(advanceInput.amount);
      initialPayments.push({
        id: `p-${Date.now()}`,
        stayId,
        amount: advanceAmount,
        method: advanceInput.paymentMethod || advanceInput.method || 'CASH',
        transactionRef: advanceInput.transactionReference || advanceInput.transactionRef || `ADV-${Date.now().toString().slice(-6)}`,
        status: 'COMPLETED',
        notes: advanceInput.paymentNotes || advanceInput.notes || 'Advance payment collected at check-in',
        createdAt: new Date().toISOString(),
      });
    }

    const bookingSourceObj = this.getBookingSources().find((b) => b.id === bookingInput.bookingSourceId);
    const bookingSourceName = bookingSourceObj ? bookingSourceObj.name : (stayInput.bookingSource || 'Walk-in');
    const bookingRef = bookingInput.externalBookingRef || stayInput.bookingRef || undefined;

    const newStay: MockStay = this.normalizeStay({
      id: stayId,
      stayNumber: `RIV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      guestId: guest.id,
      guest,
      roomId: room.id,
      room,
      checkInDate,
      checkOutDate,
      actualCheckIn: new Date().toISOString(),
      nights,
      totalNights: nights,
      adults: Number(stayInput.adultsCount || stayInput.adults || 1),
      children: Number(stayInput.childrenCount || stayInput.children || 0),
      status: 'ACTIVE',
      ratePerNight,
      bookingSource: bookingSourceObj || { id: 'bs-walkin', name: bookingSourceName },
      bookingRef,
      specialRequests: stayInput.specialRequests || '',
      signatureUrl,
      charges: initialCharges,
      payments: initialPayments,
      invoices: [],
      totalCharges: totalRoomCharge,
      totalPayments: advanceAmount,
      outstandingBalance: Math.max(0, totalRoomCharge - advanceAmount),
      financials: {
        totalCharges: totalRoomCharge,
        totalPayments: advanceAmount,
        outstandingBalance: Math.max(0, totalRoomCharge - advanceAmount),
      },
      createdAt: new Date().toISOString(),
    });

    // 4. Update room occupancy
    room.status = 'OCCUPIED';
    room.currentStayId = newStay.id;
    room.currentStay = {
      id: newStay.id,
      stayNumber: newStay.stayNumber,
      guestName: `${guest.firstName} ${guest.lastName}`,
    };

    this.stays.unshift(newStay);

    // 5. Audit log
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'CHECK_IN_COMPLETED',
      entityType: 'STAY',
      entityId: newStay.id,
      actorEmail: 'staff@rivanta.com',
      actorRole: 'RECEPTIONIST',
      details: `Guest ${guest.firstName} ${guest.lastName} checked into Room ${room.roomNumber} via ${typeof newStay.bookingSource === 'object' ? newStay.bookingSource.name : newStay.bookingSource}. Advance: ₹${advanceAmount.toLocaleString()}.`,
      timestamp: new Date().toISOString(),
    });

    this.save();
    return newStay;
  }

  public addCharge(stayId: string, chargeDto: any) {
    const stay = this.stays.find((s) => s.id === stayId);
    if (!stay) throw new Error('Stay not found');

    const qty = Number(chargeDto.quantity) || 1;
    const unitPrice = Number(chargeDto.unitPrice) || 0;
    const taxRate = Number(chargeDto.taxRate) || 18;
    const subtotal = qty * unitPrice;
    const taxAmount = Math.round((subtotal * taxRate) / 100);
    const totalAmount = subtotal + taxAmount;

    const newCharge: MockCharge = {
      id: `c-${Date.now()}`,
      stayId,
      category: chargeDto.category || 'MISC',
      description: chargeDto.description || 'Hotel Charge',
      quantity: qty,
      unitPrice,
      taxRate,
      taxAmount,
      totalAmount,
      isVoid: false,
      postedAt: new Date().toISOString(),
    };

    stay.charges.push(newCharge);
    stay.totalCharges += totalAmount;
    stay.outstandingBalance += totalAmount;
    stay.financials = {
      totalCharges: stay.totalCharges,
      totalPayments: stay.totalPayments,
      outstandingBalance: stay.outstandingBalance,
    };

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'CHARGE_ADDED',
      entityType: 'STAY_CHARGE',
      entityId: newCharge.id,
      actorEmail: 'staff@rivanta.com',
      actorRole: 'RECEPTIONIST',
      details: `Charge ${newCharge.description} (₹${totalAmount.toLocaleString()}) added to Stay ${stay.stayNumber}.`,
      timestamp: new Date().toISOString(),
    });

    this.save();
    return stay;
  }

  public voidCharge(stayId: string, chargeId: string, reason: string) {
    const stay = this.stays.find((s) => s.id === stayId);
    if (!stay) throw new Error('Stay not found');

    const charge = stay.charges.find((c) => c.id === chargeId);
    if (!charge) throw new Error('Charge not found');
    if (charge.isVoid) throw new Error('Charge is already voided');

    charge.isVoid = true;
    charge.voidReason = reason;

    stay.totalCharges -= charge.totalAmount;
    stay.outstandingBalance -= charge.totalAmount;
    stay.financials = {
      totalCharges: stay.totalCharges,
      totalPayments: stay.totalPayments,
      outstandingBalance: stay.outstandingBalance,
    };

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'CHARGE_VOIDED',
      entityType: 'STAY_CHARGE',
      entityId: charge.id,
      actorEmail: 'staff@rivanta.com',
      actorRole: 'RECEPTIONIST',
      details: `Charge ${charge.description} voided on Stay ${stay.stayNumber}. Reason: ${reason}.`,
      timestamp: new Date().toISOString(),
    });

    this.save();
    return stay;
  }

  public addPayment(stayId: string, paymentDto: any) {
    const stay = this.stays.find((s) => s.id === stayId);
    if (!stay) throw new Error('Stay not found');

    const amount = Number(paymentDto.amount);
    if (amount <= 0) throw new Error('Payment amount must be greater than 0');

    const newPayment: MockPayment = {
      id: `p-${Date.now()}`,
      stayId,
      amount,
      method: paymentDto.method || 'CASH',
      transactionRef: paymentDto.transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
      status: 'COMPLETED',
      notes: paymentDto.notes,
      createdAt: new Date().toISOString(),
    };

    stay.payments.push(newPayment);
    stay.totalPayments += amount;
    stay.outstandingBalance -= amount;
    stay.financials = {
      totalCharges: stay.totalCharges,
      totalPayments: stay.totalPayments,
      outstandingBalance: stay.outstandingBalance,
    };

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'PAYMENT_COLLECTED',
      entityType: 'PAYMENT',
      entityId: newPayment.id,
      actorEmail: 'staff@rivanta.com',
      actorRole: 'RECEPTIONIST',
      details: `Payment ₹${amount.toLocaleString()} (${newPayment.method}) collected for Stay ${stay.stayNumber}. Ref: ${newPayment.transactionRef}.`,
      timestamp: new Date().toISOString(),
    });

    this.save();
    return stay;
  }

  public extendStay(stayId: string, newCheckOutDate: string) {
    const stay = this.stays.find((s) => s.id === stayId);
    if (!stay) throw new Error('Stay not found');

    const originalCheckOut = new Date(stay.checkOutDate);
    const updatedCheckOut = new Date(newCheckOutDate);
    const diffDays = Math.ceil((updatedCheckOut.getTime() - originalCheckOut.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) throw new Error('Extension date must be after current checkout date');

    const addNights = diffDays;
    const ratePerNight = stay.ratePerNight;
    const subtotal = ratePerNight * addNights;
    const taxRate = ratePerNight > 7500 ? 18 : 12;
    const taxAmount = Math.round((subtotal * taxRate) / 100);
    const totalAmount = subtotal + taxAmount;

    const extensionCharge: MockCharge = {
      id: `c-${Date.now()}`,
      stayId,
      category: 'ROOM',
      description: `Room Extension (${addNights} extra night${addNights > 1 ? 's' : ''} @ ₹${ratePerNight.toLocaleString()})`,
      quantity: addNights,
      unitPrice: ratePerNight,
      taxRate,
      taxAmount,
      totalAmount,
      isVoid: false,
      postedAt: new Date().toISOString(),
    };

    stay.checkOutDate = newCheckOutDate;
    stay.nights += addNights;
    stay.totalNights = stay.nights;
    stay.charges.push(extensionCharge);
    stay.totalCharges += totalAmount;
    stay.outstandingBalance += totalAmount;
    stay.financials = {
      totalCharges: stay.totalCharges,
      totalPayments: stay.totalPayments,
      outstandingBalance: stay.outstandingBalance,
    };

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'STAY_EXTENDED',
      entityType: 'STAY',
      entityId: stay.id,
      actorEmail: 'staff@rivanta.com',
      actorRole: 'RECEPTIONIST',
      details: `Stay ${stay.stayNumber} extended by ${addNights} night(s) to ${newCheckOutDate}. Extra charges: ₹${totalAmount.toLocaleString()}.`,
      timestamp: new Date().toISOString(),
    });

    this.save();
    return stay;
  }

  public generateInvoice(stayId: string) {
    const stay = this.stays.find((s) => s.id === stayId);
    if (!stay) throw new Error('Stay not found');

    const activeCharges = stay.charges.filter((c) => !c.isVoid);
    const subtotal = activeCharges.reduce((acc, c) => acc + c.quantity * c.unitPrice, 0);
    const taxTotal = activeCharges.reduce((acc, c) => acc + c.taxAmount, 0);
    const grandTotal = subtotal + taxTotal;
    const invoiceNum = `RIV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      stayId: stay.id,
      guestName: `${stay.guest.firstName} ${stay.guest.lastName}`,
      roomNumber: stay.room.roomNumber,
      subtotal,
      taxTotal,
      grandTotal,
      paidAmount: stay.totalPayments,
      outstandingAmount: Math.max(0, grandTotal - stay.totalPayments),
      status: grandTotal - stay.totalPayments <= 0 ? 'PAID' : 'PARTIALLY_PAID',
      issuedAt: new Date().toISOString(),
      lineItems: activeCharges,
      payments: stay.payments,
    };

    stay.invoices.push(invoice);
    this.save();
    return invoice;
  }

  public checkOut(stayId: string) {
    const stay = this.stays.find((s) => s.id === stayId);
    if (!stay) throw new Error('Stay not found');

    if (stay.outstandingBalance > 0) {
      throw new Error(`Cannot checkout with pending balance of ₹${stay.outstandingBalance.toLocaleString()}. Please collect payment.`);
    }

    stay.status = 'CHECKED_OUT';
    stay.actualCheckOut = new Date().toISOString();

    // Set room to DIRTY
    const room = this.rooms.find((r) => r.id === stay.roomId);
    if (room) {
      room.status = 'AVAILABLE';
      room.housekeepingStatus = 'DIRTY';
      room.currentStayId = null;
      room.currentStay = null;

      // Add housekeeping task
      this.housekeeping.unshift({
        id: `hk-${Date.now()}`,
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType?.name || 'Standard Room',
        taskType: 'TURNOVER',
        priority: 'HIGH',
        status: 'PENDING',
        notes: `Turnover cleaning after checkout of Guest ${stay.guest.firstName} ${stay.guest.lastName}`,
        createdAt: new Date().toISOString(),
      });
    }

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'CHECK_OUT_COMPLETED',
      entityType: 'STAY',
      entityId: stay.id,
      actorEmail: 'staff@rivanta.com',
      actorRole: 'RECEPTIONIST',
      details: `Guest ${stay.guest.firstName} ${stay.guest.lastName} checked out of Room ${stay.room?.roomNumber || '—'}. Room marked DIRTY for housekeeping turnover.`,
      timestamp: new Date().toISOString(),
    });

    this.save();
    return stay;
  }

  public updateHousekeepingTask(taskId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') {
    const task = this.housekeeping.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    task.status = status;

    if (status === 'COMPLETED') {
      const room = this.rooms.find((r) => r.id === task.roomId);
      if (room && room.status !== 'OCCUPIED') {
        room.housekeepingStatus = 'CLEAN';
      }
    }
    this.save();
    return task;
  }

  public updateRoomHousekeeping(roomId: string, housekeepingStatus: 'CLEAN' | 'INSPECTED' | 'DIRTY' | 'IN_PROGRESS') {
    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) throw new Error('Room not found');
    room.housekeepingStatus = housekeepingStatus;
    this.save();
    return room;
  }

  public getHousekeepingTasks() {
    return this.housekeeping;
  }

  public getAuditLogs() {
    return this.auditLogs;
  }

  public getCatalogCategories() {
    return [
      { id: 'cat-1', name: 'Food & Dining', code: 'FOOD' },
      { id: 'cat-2', name: 'Bar & Spirits', code: 'BAR' },
      { id: 'cat-3', name: 'Spa & Wellness', code: 'SPA' },
      { id: 'cat-4', name: 'Laundry Services', code: 'LAUNDRY' },
      { id: 'cat-5', name: 'Transport & Chauffeur', code: 'TRANSPORT' },
      { id: 'cat-6', name: 'Extra Bedding & Minibar', code: 'MISC' },
    ];
  }

  public getCatalogItems() {
    return [
      { id: 'it-1', categoryId: 'cat-1', name: 'Royal Rajasthani Thali', category: 'FOOD_BEVERAGE', price: 1200, taxRate: 18 },
      { id: 'it-2', categoryId: 'cat-1', name: 'Dum Biryani with Mirchi Salan', category: 'FOOD_BEVERAGE', price: 850, taxRate: 18 },
      { id: 'it-3', categoryId: 'cat-1', name: 'Continental Breakfast Basket', category: 'FOOD_BEVERAGE', price: 650, taxRate: 18 },
      { id: 'it-4', categoryId: 'cat-2', name: 'Single Malt Scotch 60ml', category: 'BAR', price: 1400, taxRate: 18 },
      { id: 'it-5', categoryId: 'cat-2', name: 'Sula Dindori Reserve Red Wine', category: 'BAR', price: 650, taxRate: 18 },
      { id: 'it-6', categoryId: 'cat-2', name: 'Signature Rajputana Cocktail', category: 'BAR', price: 750, taxRate: 18 },
      { id: 'it-7', categoryId: 'cat-3', name: 'Ayurvedic Abhyanga Massage 60m', category: 'SPA', price: 3500, taxRate: 18 },
      { id: 'it-8', categoryId: 'cat-4', name: 'Express Laundry (Per Set)', category: 'LAUNDRY', price: 250, taxRate: 18 },
      { id: 'it-9', categoryId: 'cat-5', name: 'Airport Luxury Sedan Drop', category: 'TRANSPORT', price: 2200, taxRate: 18 },
      { id: 'it-10', categoryId: 'cat-6', name: 'Rollaway Extra Bed per Night', category: 'ROOM', price: 1500, taxRate: 12 },
    ];
  }

  public getBookingSources() {
    return [
      { id: 'bs-1', name: 'Walk-in', code: 'WALK_IN', commissionRate: 0 },
      { id: 'bs-2', name: 'Hotel Website (Direct)', code: 'DIRECT_WEB', commissionRate: 0 },
      { id: 'bs-3', name: 'Phone / Concierge', code: 'PHONE', commissionRate: 0 },
      { id: 'bs-4', name: 'Agoda', code: 'AGODA', commissionRate: 15 },
      { id: 'bs-5', name: 'MakeMyTrip', code: 'MAKEMYTRIP', commissionRate: 18 },
      { id: 'bs-6', name: 'Booking.com', code: 'BOOKING_COM', commissionRate: 15 },
      { id: 'bs-7', name: 'Expedia', code: 'EXPEDIA', commissionRate: 16 },
      { id: 'bs-8', name: 'Corporate Partner', code: 'CORPORATE', commissionRate: 5 },
    ];
  }

  public getKpis(timeframe: string = 'today') {
    const totalRooms = this.rooms.length;
    const occupiedRooms = this.rooms.filter((r) => r.status === 'OCCUPIED').length;
    const availableRooms = this.rooms.filter((r) => r.status === 'AVAILABLE').length;
    const dirtyRooms = this.rooms.filter((r) => r.housekeepingStatus === 'DIRTY').length;
    const maintenanceRooms = this.rooms.filter((r) => r.status === 'MAINTENANCE').length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const arrivalsCount = this.stays.filter((s) => s.status === 'ACTIVE' && s.checkInDate.startsWith('2026-10-11')).length;
    const departuresCount = this.stays.filter((s) => s.checkOutDate.startsWith('2026-10-11')).length;

    // Financials
    const totalRevenue = this.stays.reduce((acc, s) => acc + s.totalCharges, 0);
    const paymentsCollected = this.stays.reduce((acc, s) => acc + s.totalPayments, 0);
    const pendingBalances = this.stays.filter((s) => s.status === 'ACTIVE').reduce((acc, s) => acc + s.outstandingBalance, 0);

    const kpisData = {
      timeframe,
      totalRooms,
      occupiedRooms,
      availableRooms,
      dirtyRooms,
      cleaningRequired: dirtyRooms,
      maintenanceRooms,
      occupancyPercentage: occupancyRate,
      todayActualCheckIns: arrivalsCount,
      todayExpectedRemainingCheckIns: 2,
      todayCompletedCheckOuts: departuresCount,
      todayExpectedRemainingCheckOuts: 1,
      totalRevenue,
      netCashCollected: paymentsCollected,
      pendingBalances,
      outstandingGuestBalances: pendingBalances,
      todayRevenue: 28450,
      todayCollections: 20040,
    };

    return {
      ...kpisData,
      kpis: kpisData,
    };
  }

  public getRevenueReport(timeframe: string = 'month') {
    const dailyTrends = [
      { date: '10/05', revenue: 30700 },
      { date: '10/06', revenue: 41100 },
      { date: '10/07', revenue: 33950 },
      { date: '10/08', revenue: 50200 },
      { date: '10/09', revenue: 54700 },
      { date: '10/10', revenue: 65600 },
      { date: '10/11', revenue: 45800 },
    ];

    const categoryBreakdown = [
      { name: 'Room Tariff', total: 96810 },
      { name: 'Dining', total: 4366 },
      { name: 'Spa', total: 4130 },
      { name: 'Transport', total: 2596 },
      { name: 'Bar', total: 2301 },
      { name: 'Laundry', total: 2739 },
    ];

    return {
      dailyTrends,
      categoryBreakdown,
      chartData: dailyTrends,
      breakdown: categoryBreakdown,
      summary: {
        totalRecognizedRevenue: 112942,
        totalPaymentsCollected: 60120,
        netReceivables: 52822,
        roomRevenue: 96810,
        diningRevenue: 4366,
        barRevenue: 2301,
        spaRevenue: 4130,
        transportRevenue: 2596,
        taxesCollected: 16842,
      },
    };
  }

  public getOccupancyReport() {
    const totalRooms = this.rooms.length;
    const occupied = this.rooms.filter((r) => r.status === 'OCCUPIED').length;
    const cleanAvailable = this.rooms.filter((r) => r.status === 'AVAILABLE' && (r.housekeepingStatus === 'CLEAN' || r.housekeepingStatus === 'INSPECTED')).length;
    const dirty = this.rooms.filter((r) => r.housekeepingStatus === 'DIRTY').length;
    const maintenance = this.rooms.filter((r) => r.status === 'MAINTENANCE').length;

    return {
      totalRooms,
      occupied,
      available: cleanAvailable,
      dirty,
      maintenance,
      currentOccupancyRate: Math.round((occupied / totalRooms) * 100),
      trendData: [
        { date: 'Mon', occupied: 11, available: 6, occupancyRate: 64 },
        { date: 'Tue', occupied: 12, available: 5, occupancyRate: 70 },
        { date: 'Wed', occupied: 10, available: 7, occupancyRate: 58 },
        { date: 'Thu', occupied: 14, available: 3, occupancyRate: 82 },
        { date: 'Fri', occupied: 16, available: 1, occupancyRate: 94 },
        { date: 'Sat', occupied: 15, available: 2, occupancyRate: 88 },
        { date: 'Sun', occupied: 13, available: 4, occupancyRate: 76 },
      ],
      byRoomType: [
        { id: 'rt-1', name: 'Deluxe Heritage Room', type: 'Deluxe Heritage Room', total: 5, occupied: 1, rate: 20, occupancyRate: 20 },
        { id: 'rt-2', name: 'Executive Palace Suite', type: 'Executive Palace Suite', total: 5, occupied: 1, rate: 20, occupancyRate: 20 },
        { id: 'rt-3', name: 'Royal Maharajah Suite', type: 'Royal Maharajah Suite', total: 4, occupied: 1, rate: 25, occupancyRate: 25 },
        { id: 'rt-4', name: 'Presidential Penthouse', type: 'Presidential Penthouse', total: 3, occupied: 0, rate: 0, occupancyRate: 0 },
      ],
      byFloor: [
        { floor: 1, occupied: 1, total: 5, occupancyRate: 20 },
        { floor: 2, occupied: 1, total: 5, occupancyRate: 20 },
        { floor: 3, occupied: 1, total: 4, occupancyRate: 25 },
        { floor: 4, occupied: 0, total: 3, occupancyRate: 0 },
      ],
    };
  }

  public getBookingReport() {
    const sources = [
      { id: 'src-1', name: 'MakeMyTrip', isDirect: false, commissionRate: 18, totalBookings: 12, bookingValue: 289000, roomNights: 34, totalNights: 34, revenue: 289000, commission: 52020, commissionEstimated: 52020, paymentsReceived: 245000, share: 34 },
      { id: 'src-2', name: 'Booking.com', isDirect: false, commissionRate: 15, totalBookings: 9, bookingValue: 216000, roomNights: 26, totalNights: 26, revenue: 216000, commission: 32400, commissionEstimated: 32400, paymentsReceived: 190000, share: 25 },
      { id: 'src-3', name: 'Walk-in', isDirect: true, commissionRate: 0, totalBookings: 8, bookingValue: 84000, roomNights: 12, totalNights: 12, revenue: 84000, commission: 0, commissionEstimated: 0, paymentsReceived: 84000, share: 22 },
      { id: 'src-4', name: 'Direct Website', isDirect: true, commissionRate: 0, totalBookings: 5, bookingValue: 142000, roomNights: 15, totalNights: 15, revenue: 142000, commission: 0, commissionEstimated: 0, paymentsReceived: 142000, share: 14 },
      { id: 'src-5', name: 'Agoda', isDirect: false, commissionRate: 15, totalBookings: 2, bookingValue: 28000, roomNights: 4, totalNights: 4, revenue: 28000, commission: 4200, commissionEstimated: 4200, paymentsReceived: 25000, share: 5 },
    ];
    (sources as any).sources = sources;
    (sources as any).summary = {
      totalBookings: 36,
      totalRoomNights: 91,
      totalBookingValue: 759000,
      directShare: 36,
      otaShare: 64,
      avgStayDuration: '2.5 nights',
    };
    return sources;
  }

  public getStaffList() {
    return [
      { id: 'u-1', email: 'admin@rivanta.com', firstName: 'Raghuvir', lastName: 'Singh', role: 'ADMIN', status: 'ACTIVE', phone: '+91 98290 11223' },
      { id: 'u-2', email: 'receptionist@rivanta.com', firstName: 'Aarav', lastName: 'Mehta', role: 'RECEPTIONIST', status: 'ACTIVE', phone: '+91 98290 44556' },
      { id: 'u-3', email: 'housekeeping@rivanta.com', firstName: 'Anita', lastName: 'Devi', role: 'HOUSEKEEPING', status: 'ACTIVE', phone: '+91 98290 77889' },
      { id: 'u-4', email: 'accountant@rivanta.com', firstName: 'Manoj', lastName: 'Gupta', role: 'ACCOUNTANT', status: 'ACTIVE', phone: '+91 98290 99001' },
    ];
  }
}

// Global singleton instance
export const mockStore = new MockStoreService();
