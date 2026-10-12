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
import { Receipt, Download, Search, Printer, Share2 } from 'lucide-react';

export default function InvoicesListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/billing/invoices?query=${encodeURIComponent(query)}`);
      setInvoices(res?.invoices || []);
    } catch (err: any) {
      toast.error('Failed to load invoices: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownloadPdf = (invoiceId: string) => {
    const url = `http://localhost:4000/api/billing/invoices/${invoiceId}/pdf`;
    window.open(url, '_blank');
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Invoices & Billing Archive</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Immutable tax invoices, PDF downloads, and settlement history
          </p>
        </div>
      </div>

      <Card className="p-4! mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchInvoices();
          }}
          className="flex gap-3"
        >
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by invoice number, guest name, or room..."
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Filter Invoices
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title={`Invoices Archive (${invoices.length})`} subtitle="Persisted tax invoices" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">
            No invoices found. Generate an invoice from any active or completed stay folio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Invoice #</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Guest & Room</th>
                  <th className="pb-3 text-right">Subtotal (₹)</th>
                  <th className="pb-3 text-right">Tax (₹)</th>
                  <th className="pb-3 text-right">Total (₹)</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-[#172554]">{inv.invoiceNumber}</td>
                    <td className="py-3 text-[#64748B]">{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                    <td className="py-3">
                      <p className="font-semibold text-[#111827]">{inv.stay?.guest?.fullName}</p>
                      <p className="text-[10px] text-[#64748B]">Room {inv.stay?.room?.roomNumber}</p>
                    </td>
                    <td className="py-3 text-right font-mono">₹{Number(inv.subtotal).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-mono">₹{Number(inv.taxTotal).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-mono font-bold text-[#172554]">
                      ₹{Number(inv.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-center">
                      <Badge
                        variant={
                          inv.status === 'PAID'
                            ? 'success'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPdf(inv.id)}
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                        >
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => router.push(`/front-desk/billing/${inv.stayId}`)}
                        >
                          Folio
                        </Button>
                      </div>
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
