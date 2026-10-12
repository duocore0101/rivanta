'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Receipt,
  BedDouble,
  Shield,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

function GuestProfileDetailContent() {
  const params = useParams();
  const router = useRouter();
  const guestId = params.id as string;

  const [guest, setGuest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuest = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/guests/${guestId}`);
        setGuest(data);
      } catch (err: any) {
        toast.error('Failed to load guest profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    if (guestId) fetchGuest();
  }, [guestId]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="py-24 text-center text-xs text-[#94A3B8]">Loading guest profile...</div>
      </DashboardShell>
    );
  }

  if (!guest) {
    return (
      <DashboardShell>
        <div className="py-24 text-center text-xs text-[#DC2626]">Guest not found</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      {/* Back button & Title */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push('/front-desk/guests')}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to Directory
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Guest Bio & Lifetime Stats */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
              <div className="w-12 h-12 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-lg">
                {(guest.fullName || `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || 'G')[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  {guest.fullName || `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || 'Guest'}
                  {guest.isVip && <Badge variant="accent">VIP</Badge>}
                </h2>
                <p className="text-xs text-[#64748B]">Guest ID: {guest.id?.substring(0, 8)}</p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-[#334155]">
                <Phone className="w-3.5 h-3.5 text-[#0F766E]" />
                <span className="font-semibold">{guest.phone}</span>
              </div>
              {guest.email && (
                <div className="flex items-center gap-2 text-[#334155]">
                  <Mail className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>{guest.email}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-[#334155]">
                <MapPin className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                <span>{guest.address ? `${guest.address}, ${guest.city}, ${guest.state} - ${guest.postalCode}, ${guest.country}` : `${guest.city}, ${guest.country}`}</span>
              </div>
              <div className="flex items-center gap-2 text-[#334155]">
                <Shield className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>{guest.idType}: <strong className="font-mono">{guest.idNumber}</strong></span>
              </div>
            </div>
          </Card>

          {/* Lifetime Metrics */}
          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader title="Guest Lifetime Analytics" subtitle="Persisted spend across all visits" />
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <span className="text-[#64748B]">Total Stays</span>
                <p className="text-xl font-bold text-[#172554] mt-0.5">{guest.analytics?.totalStays || 0}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <span className="text-[#64748B]">Total Lifetime Spend</span>
                <p className="text-xl font-bold text-[#15803D] mt-0.5">₹{Number(guest.analytics?.totalLifetimeSpent || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="col-span-2 p-3 bg-white rounded-lg border border-blue-100 flex justify-between items-center">
                <span className="text-[#64748B]">Current Outstanding</span>
                <span className="text-base font-bold text-[#DC2626]">₹{Number(guest.analytics?.outstandingBalance || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: Stay History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Stay History & Room Bookings"
              subtitle="All chronological hotel stays recorded for this guest"
            />

            {guest.stays?.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-8 text-center">No stays on record</p>
            ) : (
              <div className="space-y-4">
                {guest.stays.map((stay: any) => (
                  <div
                    key={stay.id}
                    className="p-4 rounded-xl border border-[#E2E8F0] hover:border-[#172554] bg-[#F8FAFC]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-[#111827]">Stay #{stay.stayNumber}</span>
                        <Badge variant={stay.status === 'ACTIVE' ? 'info' : 'neutral'} size="sm">
                          {stay.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#0F766E] font-semibold">
                        Room {stay.room?.roomNumber || '—'} ({stay.room?.roomType?.name || (typeof stay.room?.roomType === 'string' ? stay.room.roomType : 'Standard Room')})
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {new Date(stay.checkInTime || stay.createdAt || Date.now()).toLocaleDateString('en-IN')} to {new Date(stay.expectedCheckOutTime || stay.checkOutDate || Date.now()).toLocaleDateString('en-IN')} ({stay.totalNights || stay.nights || 1} nights)
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        Source: {typeof stay.bookingSource === 'object' ? stay.bookingSource?.name : (stay.bookingSource || 'Direct')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => router.push(`/front-desk/billing/${stay.id}`)}
                      >
                        View Folio & Bill
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

export default function GuestProfileDetailPage() {
  return (
    <React.Suspense fallback={<DashboardShell><div className="py-24 text-center text-xs text-[#94A3B8]">Loading guest profile...</div></DashboardShell>}>
      <GuestProfileDetailContent />
    </React.Suspense>
  );
}
