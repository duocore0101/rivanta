'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Layers, ShieldCheck, Printer, Download } from 'lucide-react';

export default function BookingSourcesReportPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/reports/bookings');
        setSources(data || []);
      } catch (err: any) {
        toast.error('Failed to load booking sources report: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Booking Source & OTA Analytics</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Internal tracking of booking origins, commission liabilities, and direct vs partner ratios
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button size="sm" variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
            Print Report
          </Button>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl mb-6 text-xs text-[#334155] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#111827]">OTA Attribution Architecture Notice</p>
          <p className="text-[#64748B] mt-0.5">
            Booking source records (MakeMyTrip, Agoda, Booking.com, Expedia) are tracked internally without direct third-party platform API integration.
            Commission calculations reflect configured contractual rates.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader title={`Configured Booking Sources (${sources.length})`} subtitle="Performance and commission summary" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading booking sources...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Source Channel</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-center">Contract Comm (%)</th>
                  <th className="pb-3 text-center">Stays Booked</th>
                  <th className="pb-3 text-center">Room Nights</th>
                  <th className="pb-3 text-right">Gross Value (₹)</th>
                  <th className="pb-3 text-right">Hotel Collected (₹)</th>
                  <th className="pb-3 text-right">Est. Commission (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {sources.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 font-bold text-[#111827]">{s.name}</td>
                    <td className="py-3.5">
                      <Badge variant={s.isDirect ? 'success' : 'info'} size="sm">
                        {s.isDirect ? 'Direct Booking' : 'OTA Partner'}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-center font-mono">{s.commissionRate}%</td>
                    <td className="py-3.5 text-center font-mono font-bold text-[#172554]">{s.totalBookings}</td>
                    <td className="py-3.5 text-center font-mono">{s.totalNights || s.roomNights || 0}</td>
                    <td className="py-3.5 text-right font-mono font-bold text-[#111827]">
                      ₹{Number(s.bookingValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-right font-mono text-[#15803D] font-bold">
                      ₹{Number(s.paymentsReceived || s.bookingValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-right font-mono text-[#D97706] font-bold">
                      ₹{Number(s.commissionEstimated || s.commission || 0).toLocaleString('en-IN')}
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
