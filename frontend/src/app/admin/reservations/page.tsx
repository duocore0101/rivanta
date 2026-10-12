'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { CalendarCheck, Plus } from 'lucide-react';

export default function AdminReservationsPage() {
  const router = useRouter();
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/stays');
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
          <h1 className="text-2xl font-bold text-[#111827]">Reservations Master Table</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Admin oversight of all confirmed reservations and registered stays
          </p>
        </div>
        <Button size="sm" variant="accent" onClick={() => router.push('/front-desk/check-in')} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          New Reservation
        </Button>
      </div>

      <Card>
        <CardHeader title={`Reservations Ledger (${stays.length})`} subtitle="Persisted database records" />
        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading reservations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Stay Reference</th>
                  <th className="pb-3">Guest Name</th>
                  <th className="pb-3">Room Assigned</th>
                  <th className="pb-3">Check-in</th>
                  <th className="pb-3">Check-out</th>
                  <th className="pb-3">Booking Source</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {stays.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-[#172554]">{s.stayNumber}</td>
                    <td className="py-3 font-semibold text-[#111827]">{s.guest?.fullName}</td>
                    <td className="py-3 text-[#0F766E] font-medium">Room {s.room?.roomNumber} ({s.room?.roomType?.name})</td>
                    <td className="py-3 text-[#64748B]">{new Date(s.checkInTime).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 text-[#64748B]">{new Date(s.expectedCheckOutTime).toLocaleDateString('en-IN')}</td>
                    <td className="py-3">
                      <Badge variant="accent" size="sm">{s.bookingSource?.name}</Badge>
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant={s.status === 'ACTIVE' ? 'info' : 'neutral'} size="sm">
                        {s.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/front-desk/billing/${s.id}`)}>
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
