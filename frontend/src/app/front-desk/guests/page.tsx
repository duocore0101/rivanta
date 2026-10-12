'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Users, Search, UserPlus, Phone, Mail, ArrowRight } from 'lucide-react';

function GuestDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuests = async (searchStr = query) => {
    try {
      setLoading(true);
      const res = await apiRequest(`/guests?query=${encodeURIComponent(searchStr)}`);
      setGuests(res?.guests || []);
    } catch (err: any) {
      toast.error('Failed to load guest directory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests(initialQuery);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGuests();
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Guest Directory</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Search hotel guest profiles, identification records, and past stays
          </p>
        </div>
        <Button
          size="sm"
          variant="accent"
          onClick={() => router.push('/front-desk/check-in')}
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
        >
          Register New Guest
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4! mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by guest name, phone, email, or government ID number..."
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search Directory
          </Button>
        </form>
      </Card>

      {/* Guests Table */}
      <Card>
        <CardHeader
          title={`Registered Guests (${guests.length})`}
          subtitle="Profiles persisted in PostgreSQL database"
        />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading guests...</div>
        ) : guests.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">
            No guests found matching "{query}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Guest Profile</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Government ID</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3 text-center">Total Stays</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs">
                          {(g.fullName || `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'G')[0]}
                        </div>
                        <div>
                          <p className="font-bold text-[#111827] flex items-center gap-1.5">
                            {g.fullName || `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Guest'}
                            {g.isVip && <Badge variant="accent" size="sm">VIP</Badge>}
                          </p>
                          <p className="text-[10px] text-[#64748B]">Member since {new Date(g.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-[#334155]">
                      <p className="font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#64748B]" /> {g.phone}
                      </p>
                      {g.email && (
                        <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#64748B]" /> {g.email}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 font-mono text-[#475569]">
                      <span className="font-semibold text-[#111827]">{g.idType}:</span> {g.idNumber}
                    </td>
                    <td className="py-3.5 text-[#64748B]">
                      {g.city ? `${g.city}, ${g.country}` : g.country}
                    </td>
                    <td className="py-3.5 text-center font-bold text-[#172554]">
                      {g._count?.stays || 0}
                    </td>
                    <td className="py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/front-desk/guests/${g.id}`)}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
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

export default function GuestDirectoryPage() {
  return (
    <React.Suspense fallback={<DashboardShell><div className="py-12 text-center text-xs text-[#94A3B8]">Loading guest directory...</div></DashboardShell>}>
      <GuestDirectoryContent />
    </React.Suspense>
  );
}
