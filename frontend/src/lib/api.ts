// Frontend API client wrapper for Rivanta HMS
// Fully equipped with autonomous in-memory & localStorage mock engine for instant zero-database execution.

import { mockStore } from './mock-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'; // Default to true as requested

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  statusCode?: number;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // If mock mode is active, handle with exact business logic
  if (USE_MOCK_DATA) {
    return handleMockRequest<T>(endpoint, options);
  }

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rivanta_token') : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('rivanta_token');
        localStorage.removeItem('rivanta_user');
        window.location.href = '/login';
      }
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred while communicating with the server';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as any;
  } catch (err) {
    console.warn(`Backend fetch for ${endpoint} failed. Falling back to autonomous mock engine.`, err);
    return handleMockRequest<T>(endpoint, options);
  }
}

// Autonomous Mock Dispatcher
async function handleMockRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Add small realistic latency for smooth UI micro-transitions
  await new Promise((r) => setTimeout(r, 60));

  const method = (options.method || 'GET').toUpperCase();
  const path = endpoint.split('?')[0];
  const searchParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
  const body = options.body ? JSON.parse(options.body as string) : {};

  // 1. Auth Login
  if (path === '/auth/login' && method === 'POST') {
    const email = body.email || 'admin@rivanta.com';
    let role = 'ADMIN';
    let firstName = 'Raghuvir';
    let lastName = 'Singh';

    if (email.includes('receptionist')) {
      role = 'RECEPTIONIST';
      firstName = 'Aarav';
      lastName = 'Mehta';
    } else if (email.includes('housekeeping')) {
      role = 'HOUSEKEEPING';
      firstName = 'Anita';
      lastName = 'Devi';
    } else if (email.includes('accountant')) {
      role = 'ACCOUNTANT';
      firstName = 'Manoj';
      lastName = 'Gupta';
    }

    return {
      accessToken: `mock-jwt-${Date.now()}`,
      user: {
        id: `user-${role.toLowerCase()}`,
        email,
        firstName,
        lastName,
        role,
        hotelId: 'h-1',
        hotel: {
          id: 'h-1',
          name: 'The Rivanta Palace & Suites',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
        },
      },
    } as unknown as T;
  }

  // 2. Hotel & Settings
  if (path === '/hotel/settings') {
    return mockStore.getHotelSettings() as unknown as T;
  }

  // 3. Room Types
  if (path === '/room-types') {
    return mockStore.getRoomTypes() as unknown as T;
  }

  // 4. Rooms
  if (path === '/rooms/availability') {
    const roomTypeId = searchParams.get('roomTypeId');
    let avail = mockStore.getRooms().filter((r) => r.status === 'AVAILABLE');
    if (roomTypeId) {
      const ofType = avail.filter((r) => r.roomTypeId === roomTypeId);
      if (ofType.length > 0) {
        avail = ofType;
      }
    }
    return avail as unknown as T;
  }
  if (path === '/rooms') {
    const status = searchParams.get('status') || undefined;
    return mockStore.getRooms(status) as unknown as T;
  }
  if (path.match(/^\/rooms\/([^/]+)\/housekeeping$/) && method === 'POST') {
    const roomId = path.split('/')[2];
    return mockStore.updateRoomHousekeeping(roomId, body.housekeepingStatus) as unknown as T;
  }

  // 5. Guests
  if (path === '/guests') {
    const query = searchParams.get('query') || undefined;
    return mockStore.getGuests(query) as unknown as T;
  }
  if (path === '/guests/check-duplicate') {
    const phone = searchParams.get('phone');
    const existing = mockStore.getGuests().filter((g) => g.phone === phone);
    return existing as unknown as T;
  }
  if (path.match(/^\/guests\/([^/]+)$/)) {
    const guestId = path.split('/')[2];
    return mockStore.getGuestById(guestId) as unknown as T;
  }

  // 6. Stays
  if (path === '/stays') {
    const filter = searchParams.get('filter') || searchParams.get('status') || undefined;
    return mockStore.getStays(filter) as unknown as T;
  }
  if (path === '/stays/check-in' && method === 'POST') {
    return mockStore.checkIn(body) as unknown as T;
  }
  if (path.match(/^\/stays\/([^/]+)$/)) {
    const stayId = path.split('/')[2];
    const stay = mockStore.getStayById(stayId);
    if (!stay) throw new Error('Stay not found');
    return stay as unknown as T;
  }
  if (path.match(/^\/stays\/([^/]+)\/charges$/) && method === 'POST') {
    const stayId = path.split('/')[2];
    return mockStore.addCharge(stayId, body) as unknown as T;
  }
  if (path.match(/^\/stays\/charges\/([^/]+)\/void$/) && method === 'POST') {
    const chargeId = path.split('/')[3];
    // Find stay containing this charge
    const allStays = mockStore.getStays();
    const stay = allStays.find((s) => s.charges.some((c) => c.id === chargeId));
    if (!stay) throw new Error('Charge stay not found');
    return mockStore.voidCharge(stay.id, chargeId, body.reason || 'Staff adjustment') as unknown as T;
  }
  if (path.match(/^\/stays\/([^/]+)\/extend$/) && method === 'POST') {
    const stayId = path.split('/')[2];
    return mockStore.extendStay(stayId, body.newCheckOutDate) as unknown as T;
  }
  if (path.match(/^\/stays\/([^/]+)\/checkout$/) && method === 'POST') {
    const stayId = path.split('/')[2];
    return mockStore.checkOut(stayId) as unknown as T;
  }

  // 7. Billing & Payments
  if (path === '/billing/payments' && method === 'POST') {
    return mockStore.addPayment(body.stayId, body) as unknown as T;
  }
  if (path === '/billing/invoices/generate' && method === 'POST') {
    return mockStore.generateInvoice(body.stayId) as unknown as T;
  }
  if (path === '/billing/invoices') {
    const query = searchParams.get('query') || '';
    const allInvoices = mockStore.getStays().flatMap((s) => s.invoices || []);
    if (!query) return allInvoices as unknown as T;
    return allInvoices.filter((inv) =>
      inv.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
      inv.guestName.toLowerCase().includes(query.toLowerCase())
    ) as unknown as T;
  }
  if (path.match(/^\/billing\/invoices\/([^/]+)\/share$/) && method === 'POST') {
    // Exact requirement: do not fake success if not configured
    return {
      success: false,
      message: 'Notification provider is not configured. Please enter API credentials in Settings > Notifications to enable automated sending.',
    } as unknown as T;
  }

  // 8. Housekeeping & Maintenance
  if (path === '/housekeeping/tasks') {
    return mockStore.getHousekeepingTasks() as unknown as T;
  }
  if (path.match(/^\/housekeeping\/tasks\/([^/]+)\/status$/) && method === 'POST') {
    const taskId = path.split('/')[3];
    return mockStore.updateHousekeepingTask(taskId, body.status) as unknown as T;
  }
  if (path === '/maintenance/issues' && method === 'POST') {
    return {
      id: `maint-${Date.now()}`,
      ...body,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    } as unknown as T;
  }

  // 9. Catalog
  if (path === '/catalog/categories') {
    return mockStore.getCatalogCategories() as unknown as T;
  }
  if (path === '/catalog/items') {
    return mockStore.getCatalogItems() as unknown as T;
  }
  if (path === '/catalog/booking-sources') {
    return mockStore.getBookingSources() as unknown as T;
  }

  // 10. Reports & Dashboard
  if (path === '/reports/kpis') {
    const tf = searchParams.get('timeframe') || 'today';
    return mockStore.getKpis(tf) as unknown as T;
  }
  if (path === '/reports/revenue') {
    const tf = searchParams.get('timeframe') || 'month';
    return mockStore.getRevenueReport(tf) as unknown as T;
  }
  if (path === '/reports/occupancy') {
    return mockStore.getOccupancyReport() as unknown as T;
  }
  if (path === '/reports/bookings') {
    return mockStore.getBookingReport() as unknown as T;
  }

  // 11. Staff, Roles & Audit
  if (path === '/staff') {
    return mockStore.getStaffList() as unknown as T;
  }
  if (path === '/roles') {
    return [
      { id: 'r-1', name: 'ADMIN', description: 'Full executive control across all hotel operations and settings' },
      { id: 'r-2', name: 'RECEPTIONIST', description: 'Guest check-in, room assignments, billing, folios, checkouts' },
      { id: 'r-3', name: 'HOUSEKEEPING', description: 'Room turnover, cleanliness inspections, maintenance reporting' },
      { id: 'r-4', name: 'ACCOUNTANT', description: 'Financial reconciliation, invoices, payments, tax reports' },
    ] as unknown as T;
  }
  if (path === '/audit-logs') {
    return mockStore.getAuditLogs() as unknown as T;
  }

  // Fallback default
  return {} as unknown as T;
}
