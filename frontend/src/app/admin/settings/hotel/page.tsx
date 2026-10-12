'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Hotel, Save } from 'lucide-react';

export default function HotelProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hotel, setHotel] = useState<any>({
    name: '',
    legalName: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
  });

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/hotel');
        if (data) setHotel(data);
      } catch (err: any) {
        toast.error('Failed to load hotel profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/hotel', {
        method: 'PATCH',
        body: JSON.stringify(hotel),
      });
      toast.success('Hotel profile successfully updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update hotel profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Hotel Profile & Legal Identity</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          General property information, contact details, timezone, and operational currency
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader title="Property Information" subtitle="Displayed on guest receipts, tax invoices, and registration cards" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading hotel profile...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Hotel Display Name"
                required
                value={hotel.name}
                onChange={(e) => setHotel({ ...hotel, name: e.target.value })}
              />
              <Input
                label="Legal Operating Entity"
                value={hotel.legalName || ''}
                onChange={(e) => setHotel({ ...hotel, legalName: e.target.value })}
              />
              <div className="md:col-span-2">
                <Input
                  label="Street Address"
                  required
                  value={hotel.address}
                  onChange={(e) => setHotel({ ...hotel, address: e.target.value })}
                />
              </div>
              <Input
                label="City"
                required
                value={hotel.city}
                onChange={(e) => setHotel({ ...hotel, city: e.target.value })}
              />
              <Input
                label="State / Province"
                required
                value={hotel.state}
                onChange={(e) => setHotel({ ...hotel, state: e.target.value })}
              />
              <Input
                label="Postal Code"
                value={hotel.postalCode || ''}
                onChange={(e) => setHotel({ ...hotel, postalCode: e.target.value })}
              />
              <Input
                label="Country"
                value={hotel.country}
                onChange={(e) => setHotel({ ...hotel, country: e.target.value })}
              />
              <Input
                label="Front Desk Telephone"
                required
                value={hotel.phone}
                onChange={(e) => setHotel({ ...hotel, phone: e.target.value })}
              />
              <Input
                label="Reservations Email"
                required
                type="email"
                value={hotel.email}
                onChange={(e) => setHotel({ ...hotel, email: e.target.value })}
              />
              <Input
                label="Operating Timezone"
                value={hotel.timezone}
                onChange={(e) => setHotel({ ...hotel, timezone: e.target.value })}
              />
              <Input
                label="System Currency"
                value={hotel.currency}
                onChange={(e) => setHotel({ ...hotel, currency: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-[#F1F5F9] flex justify-end">
              <Button type="submit" variant="primary" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Card>
    </DashboardShell>
  );
}
