'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Receipt, Save } from 'lucide-react';

export default function BillingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    checkInTime: '14:00',
    checkOutTime: '11:00',
    defaultTaxRate: 12.0,
    invoicePrefix: 'RIV-',
    allowUnpaidCheckout: false,
    currencySymbol: '₹',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/hotel/settings');
        if (data?.settings) setSettings(data.settings);
      } catch (err: any) {
        toast.error('Failed to load billing settings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/hotel/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings),
      });
      toast.success('Billing rules and tax configurations updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Billing & Financial Policies</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Standard operational check-in/out hours, tax defaults, and invoice numbering prefixes
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader title="Operational & Billing Rules" subtitle="System-wide rules applied to room tariffs and checkout workflows" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Standard Check-In Time"
                type="time"
                required
                value={settings.checkInTime}
                onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
              />
              <Input
                label="Standard Check-Out Time"
                type="time"
                required
                value={settings.checkOutTime}
                onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
              />
              <Input
                label="Default Room GST Rate (%)"
                type="number"
                required
                value={settings.defaultTaxRate}
                onChange={(e) => setSettings({ ...settings, defaultTaxRate: Number(e.target.value) })}
              />
              <Input
                label="Invoice Number Prefix"
                required
                value={settings.invoicePrefix}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                placeholder="e.g. RIV- or INV-"
              />
              <Input
                label="Currency Symbol"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <input
                  type="checkbox"
                  id="unpaidCheckout"
                  checked={settings.allowUnpaidCheckout}
                  onChange={(e) => setSettings({ ...settings, allowUnpaidCheckout: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E]"
                />
                <label htmlFor="unpaidCheckout" className="text-xs text-amber-900 cursor-pointer">
                  <strong>Allow checkout with unpaid balance:</strong> If unchecked, front desk staff cannot complete guest checkout until the folio balance is settled to ₹0.
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F1F5F9] flex justify-end">
              <Button type="submit" variant="primary" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
                Save Policies
              </Button>
            </div>
          </form>
        )}
      </Card>
    </DashboardShell>
  );
}
