'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Users, UserCheck } from 'lucide-react';

export default function GuestDemographicsReportPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setLoading(true);
        const res = await apiRequest('/guests');
        setGuests(res?.guests || []);
      } catch (err: any) {
        toast.error('Failed to load guest report: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGuests();
  }, []);

  const repeatGuests = guests.filter((g) => (g._count?.stays || 0) > 1);
  const vipGuests = guests.filter((g) => g.isVip);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Guest Demographics & Loyalty Analytics</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Repeat guest frequency, VIP distributions, and regional nationality tracking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4!">
          <span className="text-xs font-bold text-[#64748B]">Total Registered Guests</span>
          <p className="text-2xl font-black text-[#172554] mt-1">{guests.length}</p>
        </Card>
        <Card className="p-4!">
          <span className="text-xs font-bold text-[#0F766E]">Repeat Guests</span>
          <p className="text-2xl font-black text-[#0F766E] mt-1">{repeatGuests.length}</p>
        </Card>
        <Card className="p-4!">
          <span className="text-xs font-bold text-[#D97706]">VIP Tier Guests</span>
          <p className="text-2xl font-black text-[#D97706] mt-1">{vipGuests.length}</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Guest Registry Overview" subtitle="Persisted guest demographic records" />
        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading demographics...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Guest Name</th>
                  <th className="pb-3">Nationality</th>
                  <th className="pb-3">City / Region</th>
                  <th className="pb-3 text-center">Stays</th>
                  <th className="pb-3 text-center">VIP Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-bold text-[#111827]">{g.fullName}</td>
                    <td className="py-3 text-[#475569]">{g.nationality}</td>
                    <td className="py-3 text-[#64748B]">{g.city || 'N/A'}, {g.country}</td>
                    <td className="py-3 text-center font-bold text-[#172554]">{g._count?.stays || 0}</td>
                    <td className="py-3 text-center">
                      {g.isVip ? <Badge variant="accent" size="sm">VIP</Badge> : <Badge variant="neutral" size="sm">Standard</Badge>}
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
