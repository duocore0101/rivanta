'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { LogIn, UserCheck, Calendar } from 'lucide-react';

export default function ArrivalsTodayPage() {
  const router = useRouter();
  const [arrivals, setArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayFormatted, setTodayFormatted] = useState('');

  useEffect(() => {
    setTodayFormatted(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    const fetchArrivals = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/stays?filter=ARRIVALS_TODAY');
        setArrivals(data || []);
      } catch (err: any) {
        toast.error('Failed to load arrivals: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArrivals();
  }, []);

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Today's Guest Arrivals</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Expected and processed check-ins {todayFormatted ? `for ${todayFormatted}` : ''}
          </p>
        </div>
        <Button
          size="sm"
          variant="accent"
          onClick={() => router.push('/front-desk/check-in')}
          leftIcon={<UserCheck className="w-3.5 h-3.5" />}
        >
          New Check-in
        </Button>
      </div>

      <Card>
        <CardHeader title={`Arrivals List (${arrivals.length})`} subtitle="Check-in records for today" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading arrivals...</div>
        ) : arrivals.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">
            No arrivals recorded for today yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Stay #</th>
                  <th className="pb-3">Guest Name</th>
                  <th className="pb-3">Assigned Room</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Booking Source</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {arrivals.map((stay) => {
                  const guestName = stay.guest?.fullName || (stay.guest ? `${stay.guest.firstName || ''} ${stay.guest.lastName || ''}`.trim() : 'Guest');
                  const roomNumber = stay.room?.roomNumber || '—';
                  const roomTypeName = stay.room?.roomType?.name || (typeof stay.room?.roomType === 'string' ? stay.room.roomType : 'Standard Room');
                  const sourceName = typeof stay.bookingSource === 'object' ? stay.bookingSource?.name : (stay.bookingSource || 'Direct');
                  return (
                    <tr key={stay.id} className="hover:bg-slate-50/60">
                      <td className="py-3 font-mono font-bold text-[#172554]">{stay.stayNumber}</td>
                      <td className="py-3 font-semibold text-[#111827]">{guestName}</td>
                      <td className="py-3">
                        <span className="font-bold text-[#0F766E]">Room {roomNumber}</span> ({roomTypeName})
                      </td>
                      <td className="py-3 text-[#64748B]">{stay.totalNights || stay.nights || 1} night(s)</td>
                      <td className="py-3">
                        <Badge variant="accent" size="sm">{sourceName}</Badge>
                      </td>
                    <td className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => router.push(`/front-desk/billing/${stay.id}`)}
                      >
                        Manage Folio
                      </Button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
