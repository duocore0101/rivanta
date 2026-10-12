'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Receipt, Download } from 'lucide-react';

export default function AdminInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await apiRequest('/billing/invoices');
        setInvoices(res?.invoices || []);
      } catch (err: any) {
        toast.error('Failed to load invoices: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleDownloadPdf = (id: string) => {
    window.open(`http://localhost:4000/api/billing/invoices/${id}/pdf`, '_blank');
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Invoices & Tax Records</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Auditable tax invoices with PDF reproduction
        </p>
      </div>

      <Card>
        <CardHeader title={`Invoices Archive (${invoices.length})`} subtitle="Persisted finalized invoices" />
        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading invoices...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Invoice #</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Guest & Room</th>
                  <th className="pb-3 text-right">Subtotal</th>
                  <th className="pb-3 text-right">Taxes</th>
                  <th className="pb-3 text-right">Total</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-[#172554]">{inv.invoiceNumber}</td>
                    <td className="py-3 text-[#64748B]">{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 font-semibold text-[#111827]">
                      {inv.stay?.guest?.fullName} (Room {inv.stay?.room?.roomNumber})
                    </td>
                    <td className="py-3 text-right font-mono">₹{Number(inv.subtotal).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-mono">₹{Number(inv.taxTotal).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-mono font-bold text-[#172554]">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-center">
                      <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'} size="sm">{inv.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => handleDownloadPdf(inv.id)} leftIcon={<Download className="w-3.5 h-3.5" />}>
                        PDF
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
