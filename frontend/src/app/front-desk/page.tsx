'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import {
  LogIn,
  LogOut,
  BedDouble,
  Sparkles,
  IndianRupee,
  UserCheck,
  Search,
  Receipt,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function FrontDeskHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>(null);
  const [arrivals, setArrivals] = useState<any[]>([]);
  const [departures, setDepartures] = useState<any[]>([]);
  const [inHouseStays, setInHouseStays] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kpiRes, arrivalsRes, departuresRes, inHouseRes] = await Promise.all([
        apiRequest('/reports/kpis?timeframe=today'),
        apiRequest('/stays?filter=ARRIVALS_TODAY'),
        apiRequest('/stays?filter=DEPARTURES_TODAY'),
        apiRequest('/stays?filter=IN_HOUSE'),
      ]);

      setKpis(kpiRes?.kpis || null);
      setArrivals(arrivalsRes || []);
      setDepartures(departuresRes || []);
      setInHouseStays(inHouseRes || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load front desk data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Front Desk Terminal</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Operational overview of today's guest arrivals, departures, room statuses, and folios
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/front-desk/rooms')}
            leftIcon={<BedDouble className="w-3.5 h-3.5" />}
          >
            Room Grid
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => router.push('/front-desk/check-in')}
            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
          >
            New Check-in
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card hoverable className="p-4! border-blue-100 bg-white" onClick={() => router.push('/front-desk/arrivals')}>
          <div className="flex items-center justify-between text-[#1D4ED8] mb-2">
            <span className="text-xs font-semibold">Today's Arrivals</span>
            <LogIn className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-[#111827]">{arrivals.length}</p>
          <p className="text-[11px] text-[#64748B] mt-1">Expected today</p>
        </Card>

        <Card hoverable className="p-4! border-amber-100 bg-white" onClick={() => router.push('/front-desk/departures')}>
          <div className="flex items-center justify-between text-[#D97706] mb-2">
            <span className="text-xs font-semibold">Today's Departures</span>
            <LogOut className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-[#111827]">{departures.length}</p>
          <p className="text-[11px] text-[#64748B] mt-1">Checkouts due</p>
        </Card>

        <Card hoverable className="p-4! border-indigo-100 bg-white" onClick={() => router.push('/front-desk/rooms?status=OCCUPIED')}>
          <div className="flex items-center justify-between text-[#4F46E5] mb-2">
            <span className="text-xs font-semibold">Occupied Rooms</span>
            <BedDouble className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-[#111827]">{kpis?.occupiedRooms || inHouseStays.length}</p>
          <p className="text-[11px] text-[#64748B] mt-1">{kpis?.occupancyPercentage || 0}% Occupancy</p>
        </Card>

        <Card hoverable className="p-4! border-emerald-100 bg-white" onClick={() => router.push('/front-desk/rooms?status=AVAILABLE')}>
          <div className="flex items-center justify-between text-[#15803D] mb-2">
            <span className="text-xs font-semibold">Available Rooms</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-[#111827]">{kpis?.availableRooms || 0}</p>
          <p className="text-[11px] text-[#64748B] mt-1">Ready for check-in</p>
        </Card>

        <Card hoverable className="p-4! border-rose-100 bg-white" onClick={() => router.push('/front-desk/housekeeping')}>
          <div className="flex items-center justify-between text-[#DC2626] mb-2">
            <span className="text-xs font-semibold">Dirty / Turnover</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-[#111827]">{kpis?.cleaningRequired || 0}</p>
          <p className="text-[11px] text-[#64748B] mt-1">Awaiting cleaning</p>
        </Card>

        <Card hoverable className="p-4! border-slate-200 bg-white" onClick={() => router.push('/front-desk/payments')}>
          <div className="flex items-center justify-between text-[#0F766E] mb-2">
            <span className="text-xs font-semibold">Pending Balances</span>
            <IndianRupee className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-[#111827]">
            ₹{((kpis?.outstandingGuestBalances || 0) / 1000).toFixed(1)}k
          </p>
          <p className="text-[11px] text-[#64748B] mt-1">Across active folios</p>
        </Card>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <button
          onClick={() => router.push('/front-desk/check-in')}
          className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#172554] hover:shadow-xs transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#111827]">Check-In Guest</p>
            <p className="text-[10px] text-[#64748B]">5-step verified workflow</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/front-desk/guests')}
          className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#172554] hover:shadow-xs transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#172554] flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#111827]">Find Guest Profile</p>
            <p className="text-[10px] text-[#64748B]">Search history & IDs</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/front-desk/invoices')}
          className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#172554] hover:shadow-xs transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#15803D] flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#111827]">Invoices & Bills</p>
            <p className="text-[10px] text-[#64748B]">PDF prints & settlement</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/front-desk/housekeeping')}
          className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E2E8F0] hover:border-[#172554] hover:shadow-xs transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#D97706] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#111827]">Housekeeping</p>
            <p className="text-[10px] text-[#64748B]">Mark room clean / dirty</p>
          </div>
        </button>
      </div>

      {/* Main Operational Lists: Today's Departures & Active Stays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expected Departures Today */}
        <Card>
          <CardHeader
            title="Departures Expected Today"
            subtitle="Guests scheduled to check out; process bill settlement"
            action={
              <Link href="/front-desk/departures" className="text-xs text-[#0F766E] font-semibold hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          {departures.length === 0 ? (
            <div className="text-center py-8 text-[#94A3B8] text-xs">
              No departures scheduled for today
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {departures.map((stay) => {
                const outBalance = stay.financials?.outstandingBalance ?? stay.outstandingBalance ?? 0;
                const roomTypeName = stay.room?.roomType?.name || (typeof stay.room?.roomType === 'string' ? stay.room.roomType : 'Standard Room');
                const guestName = stay.guest?.fullName || (stay.guest ? `${stay.guest.firstName || ''} ${stay.guest.lastName || ''}`.trim() : 'Guest');
                return (
                  <div key={stay.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm border border-amber-200">
                        {stay.room?.roomNumber || '—'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111827]">{guestName}</p>
                        <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                          <span>{roomTypeName}</span>
                          <span>•</span>
                          <span>Out balance: ₹{outBalance.toLocaleString('en-IN')}</span>
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/front-desk/billing/${stay.id}`)}
                    >
                      View Folio
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Guests Currently Staying (In-House) */}
        <Card>
          <CardHeader
            title="Currently In-House Guests"
            subtitle="Active stays with room assignments and real-time balances"
            action={
              <Link href="/front-desk/rooms" className="text-xs text-[#0F766E] font-semibold hover:underline flex items-center gap-1">
                View room map <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          {inHouseStays.length === 0 ? (
            <div className="text-center py-8 text-[#94A3B8] text-xs">
              No in-house guests at this time
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {inHouseStays.slice(0, 5).map((stay) => {
                const outBalance = stay.financials?.outstandingBalance ?? stay.outstandingBalance ?? 0;
                const sourceName = typeof stay.bookingSource === 'object' ? stay.bookingSource?.name : (stay.bookingSource || 'Direct');
                const guestName = stay.guest?.fullName || (stay.guest ? `${stay.guest.firstName || ''} ${stay.guest.lastName || ''}`.trim() : 'Guest');
                return (
                  <div key={stay.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#172554] font-bold flex items-center justify-center text-sm border border-blue-200">
                        {stay.room?.roomNumber || '—'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#111827]">{guestName}</p>
                          {stay.guest?.isVip && <Badge variant="accent" size="sm">VIP</Badge>}
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          Source: {sourceName} | {stay.totalNights || stay.nights || 1} nights
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#111827]">
                        {outBalance > 0 ? `₹${outBalance.toLocaleString('en-IN')}` : 'Settled'}
                      </p>
                      <Link
                        href={`/front-desk/billing/${stay.id}`}
                        className="text-[11px] text-[#0F766E] font-medium hover:underline"
                      >
                        Manage Folio
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
