'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { CreditCard, IndianRupee, Printer } from 'lucide-react';

export default function AdminPaymentsReportPage() {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/reports/payments');
        setReport(data);
      } catch (err: any) {
        toast.error('Failed to load payment reports: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Financial Collections & Reconciliation</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Breakdown by payment gateways, bank transfers, UPI receipts, and cash settlement
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button size="sm" variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
            Print Statement
          </Button>
        </div>
      </div>

      {/* Payment Methods Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {report?.byMethod?.map((m: any) => (
          <Card key={m.method} className="p-4!">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{m.method}</span>
            <p className="text-2xl font-black text-[#172554] mt-1">₹{Number(m.total).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-[#0F766E] font-medium mt-0.5">{m.count} successful transaction(s)</p>
          </Card>
        ))}
      </div>

      {/* Full Transactions Log */}
      <Card>
        <CardHeader title="Collection Ledger" subtitle="Every recorded front desk and online settlement" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading ledger...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Receipt No</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Guest & Room</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Collected By</th>
                  <th className="pb-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {report?.payments?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-[#172554]">{p.paymentNumber}</td>
                    <td className="py-3 text-[#64748B]">{new Date(p.paymentDate).toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <p className="font-semibold text-[#111827]">{p.stay?.guest?.fullName}</p>
                      <p className="text-[10px] text-[#64748B]">Room {p.stay?.room?.roomNumber}</p>
                    </td>
                    <td className="py-3">
                      <Badge variant="accent" size="sm">{p.paymentMethod}</Badge>
                    </td>
                    <td className="py-3 text-[#64748B]">{p.receivedByUser?.firstName} {p.receivedByUser?.lastName}</td>
                    <td className="py-3 text-right font-mono font-bold text-[#15803D]">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
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
