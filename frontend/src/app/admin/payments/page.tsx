'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await apiRequest('/reports/payments');
        setPayments(res?.payments || []);
      } catch (err: any) {
        toast.error('Failed to load payments: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Financial Transactions Ledger</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Admin oversight of all payments, methods, and audit trails
        </p>
      </div>

      <Card>
        <CardHeader title={`Transactions (${payments.length})`} subtitle="Persisted payment records" />
        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Receipt No</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Guest & Room</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Ref</th>
                  <th className="pb-3">Receiver</th>
                  <th className="pb-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-[#172554]">{p.paymentNumber}</td>
                    <td className="py-3 text-[#64748B]">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 font-semibold text-[#111827]">
                      {p.stay?.guest?.fullName} (Room {p.stay?.room?.roomNumber})
                    </td>
                    <td className="py-3">
                      <Badge variant="accent" size="sm">{p.paymentMethod}</Badge>
                    </td>
                    <td className="py-3 font-mono text-[#64748B]">{p.transactionReference || 'N/A'}</td>
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
