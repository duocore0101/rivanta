'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { CalendarCheck, UserPlus } from 'lucide-react';

export default function ReservationsPage() {
  const router = useRouter();
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/stays?status=ACTIVE');
        setStays(data || []);
      } catch (err: any) {
        toast.error('Failed to load reservations: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Reservations & Stays</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Overview of confirmed room assignments and active reservations
          </p>
        </div>
        <Button
          size="sm"
          variant="accent"
          onClick={() => router.push('/front-desk/check-in')}
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
        >
          New Check-in
        </Button>
      </div>

      <Card>
        <CardHeader title={`Active Bookings (${stays.length})`} subtitle="Room holds and registered folios" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading bookings...</div>
        ) : stays.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">No active bookings currently</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Stay #</th>
                  <th className="pb-3">Guest</th>
                  <th className="pb-3">Room</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Source</th>
                  <th className="pb-3 text-right">Balance</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {stays.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-[#172554]">{s.stayNumber}</td>
                    <td className="py-3 font-semibold text-[#111827]">{s.guest?.fullName}</td>
                    <td className="py-3 text-[#0F766E] font-medium">Room {s.room?.roomNumber}</td>
                    <td className="py-3 text-[#64748B]">{new Date(s.checkInTime).toLocaleDateString('en-IN')} - {new Date(s.expectedCheckOutTime).toLocaleDateString('en-IN')}</td>
                    <td className="py-3">
                      <Badge variant="accent" size="sm">{s.bookingSource?.name}</Badge>
                    </td>
                    <td className="py-3 text-right font-mono font-bold">
                      ₹{s.financials?.outstandingBalance?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/front-desk/billing/${s.id}`)}
                      >
                        Folio
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
