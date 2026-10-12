'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { CreditCard, IndianRupee, RotateCcw, ArrowRight } from 'lucide-react';

export default function PaymentsLedgerPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refund modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

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

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleProcessRefund = async () => {
    if (!selectedPayment || !refundAmount || !refundReason) {
      toast.error('Please enter refund amount and reason');
      return;
    }
    try {
      await apiRequest('/billing/refunds', {
        method: 'POST',
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          amount: Number(refundAmount),
          reason: refundReason,
        }),
      });
      toast.success('Refund processed successfully');
      setRefundModalOpen(false);
      setRefundAmount('');
      setRefundReason('');
      fetchPayments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to process refund');
    }
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Front Desk Payments Ledger</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Live financial ledger of cash, UPI, card, and bank transactions
        </p>
      </div>

      <Card>
        <CardHeader title={`Payment Transactions (${payments.length})`} subtitle="Cash receipts and settlement logs" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">
            No payment transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Receipt #</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Guest & Room</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3 text-right">Amount (₹)</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-[#172554]">{p.paymentNumber}</td>
                    <td className="py-3 text-[#64748B]">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                    <td className="py-3">
                      <p className="font-semibold text-[#111827]">{p.stay?.guest?.fullName}</p>
                      <p className="text-[10px] text-[#64748B]">Room {p.stay?.room?.roomNumber}</p>
                    </td>
                    <td className="py-3">
                      <Badge variant="accent" size="sm">{p.paymentMethod}</Badge>
                    </td>
                    <td className="py-3 text-[#64748B]">{p.paymentType}</td>
                    <td className="py-3 font-mono text-[#64748B]">{p.transactionReference || 'N/A'}</td>
                    <td className="py-3 text-right font-mono font-bold text-[#15803D]">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPayment(p);
                            setRefundAmount(String(p.amount));
                            setRefundModalOpen(true);
                          }}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5 text-amber-600" />}
                        >
                          Refund
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/front-desk/billing/${p.stayId}`)}
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

      {/* Refund Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title={`Process Refund: Receipt #${selectedPayment?.paymentNumber}`}
        subtitle="Authorized managerial refund"
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Refund Amount (₹)"
            type="number"
            required
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            helperText={`Max refundable: ₹${Number(selectedPayment?.amount || 0).toLocaleString('en-IN')}`}
          />
          <Input
            label="Authorized Reason"
            required
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="e.g. Guest checkout dispute or duplicate charge"
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRefundModalOpen(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleProcessRefund}>Authorize & Process Refund</Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
