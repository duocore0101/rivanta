'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { History, Search, ArrowRight } from 'lucide-react';

export default function GuestHistoryArchivePage() {
  const router = useRouter();
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchStays = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/stays?status=${filter}`);
        setStays(data || []);
      } catch (err: any) {
        toast.error('Failed to load guest history: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStays();
  }, [filter]);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Stay History & Archive</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Complete searchable record of historical and active guest stays
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {['ALL', 'ACTIVE', 'COMPLETED', 'EXTENDED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === status ? 'bg-[#172554] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title={`Historical Stays (${stays.length})`} subtitle="Full audit-backed stay records" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading records...</div>
        ) : stays.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">No stay records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Stay #</th>
                  <th className="pb-3">Guest Name</th>
                  <th className="pb-3">Room</th>
                  <th className="pb-3">Check-in</th>
                  <th className="pb-3">Check-out</th>
                  <th className="pb-3">Booking Source</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {stays.map((stay) => (
                  <tr key={stay.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-[#172554]">{stay.stayNumber}</td>
                    <td className="py-3 font-semibold text-[#111827]">{stay.guest?.fullName}</td>
                    <td className="py-3 text-[#0F766E] font-medium">Room {stay.room?.roomNumber}</td>
                    <td className="py-3 text-[#64748B]">{new Date(stay.checkInTime).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 text-[#64748B]">{new Date(stay.expectedCheckOutTime).toLocaleDateString('en-IN')}</td>
                    <td className="py-3">
                      <Badge variant="accent" size="sm">{stay.bookingSource?.name}</Badge>
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant={stay.status === 'COMPLETED' ? 'neutral' : 'info'} size="sm">
                        {stay.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/front-desk/billing/${stay.id}`)}
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
