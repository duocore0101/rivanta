'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

export default function DeparturesTodayPage() {
  const router = useRouter();
  const [departures, setDepartures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayFormatted, setTodayFormatted] = useState('');

  useEffect(() => {
    setTodayFormatted(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    const fetchDepartures = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/stays?filter=DEPARTURES_TODAY');
        setDepartures(data || []);
      } catch (err: any) {
        toast.error('Failed to load departures: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartures();
  }, []);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Today's Guest Departures</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Stays scheduled for checkout {todayFormatted ? `on ${todayFormatted}` : ''}
        </p>
      </div>

      <Card>
        <CardHeader title={`Departures Due (${departures.length})`} subtitle="Review folios and process checkout" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading departures...</div>
        ) : departures.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">
            No departures scheduled for today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Room</th>
                  <th className="pb-3">Guest Name</th>
                  <th className="pb-3">Stay Ref</th>
                  <th className="pb-3">Total Charges</th>
                  <th className="pb-3">Paid Amount</th>
                  <th className="pb-3">Outstanding Balance</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {departures.map((stay) => {
                  const out = stay.financials?.outstandingBalance ?? stay.outstandingBalance ?? 0;
                  const totalCharges = stay.financials?.totalCharges ?? stay.totalCharges ?? 0;
                  const totalPayments = stay.financials?.totalPayments ?? stay.totalPayments ?? 0;
                  const guestName = stay.guest?.fullName || (stay.guest ? `${stay.guest.firstName || ''} ${stay.guest.lastName || ''}`.trim() : 'Guest');
                  const roomNumber = stay.room?.roomNumber || '—';
                  return (
                    <tr key={stay.id} className="hover:bg-slate-50/60">
                      <td className="py-3">
                        <span className="font-extrabold text-sm text-[#172554]">Room {roomNumber}</span>
                      </td>
                      <td className="py-3 font-semibold text-[#111827]">{guestName}</td>
                      <td className="py-3 font-mono text-[#64748B]">{stay.stayNumber}</td>
                      <td className="py-3 font-mono">₹{totalCharges.toLocaleString('en-IN')}</td>
                      <td className="py-3 font-mono text-emerald-700">₹{totalPayments.toLocaleString('en-IN')}</td>
                      <td className="py-3 font-mono font-bold">
                        <span className={out > 0 ? 'text-[#DC2626]' : 'text-[#15803D]'}>
                          ₹{out.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          variant={out > 0 ? 'accent' : 'primary'}
                          onClick={() => router.push(`/front-desk/billing/${stay.id}`)}
                        >
                          Process Checkout
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
