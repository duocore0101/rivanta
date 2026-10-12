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
import { Users, Search, ArrowRight, UserPlus } from 'lucide-react';

export default function AdminGuestsPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/guests?query=${encodeURIComponent(query)}`);
      setGuests(res?.guests || []);
    } catch (err: any) {
      toast.error('Failed to load guests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Guest Directory & VIP Management</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Admin directory of all registered hotel guests, ID documents, and lifetime stays
          </p>
        </div>
        <Button size="sm" variant="accent" onClick={() => router.push('/front-desk/check-in')} leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
          Register Guest
        </Button>
      </div>

      <Card className="p-4! mb-6">
        <form onSubmit={(e) => { e.preventDefault(); fetchGuests(); }} className="flex gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, email, or government ID..."
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Button type="submit" variant="primary">Filter</Button>
        </form>
      </Card>

      <Card>
        <CardHeader title={`Guests Database (${guests.length})`} subtitle="Registered profiles" />
        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading guests...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Guest</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Govt ID</th>
                  <th className="pb-3">City & Country</th>
                  <th className="pb-3 text-center">Lifetime Stays</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5">
                      <p className="font-bold text-[#111827] flex items-center gap-1.5">
                        {g.fullName}
                        {g.isVip && <Badge variant="accent" size="sm">VIP</Badge>}
                      </p>
                    </td>
                    <td className="py-3.5 text-[#334155]">{g.phone}</td>
                    <td className="py-3.5 font-mono text-[#64748B]">{g.idType}: {g.idNumber}</td>
                    <td className="py-3.5 text-[#64748B]">{g.city || 'N/A'}, {g.country}</td>
                    <td className="py-3.5 text-center font-bold text-[#172554]">{g._count?.stays || 0}</td>
                    <td className="py-3.5 text-right">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/front-desk/guests/${g.id}`)}>
                        Profile
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
