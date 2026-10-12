'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import {
  Receipt,
  CreditCard,
  Plus,
  Calendar,
  LogOut,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSignature,
  Share2,
  Printer,
  Sparkles,
} from 'lucide-react';

function StayBillingFolioContent() {
  const params = useParams();
  const router = useRouter();
  const stayId = params.stayId as string;

  const [stay, setStay] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Reference data
  const [categories, setCategories] = useState<any[]>([]);
  const [serviceItems, setServiceItems] = useState<any[]>([]);

  // Charge form
  const [newCharge, setNewCharge] = useState({
    categoryId: '',
    serviceItemId: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxPercent: 5,
    discountAmount: 0,
  });

  // Payment form
  const [newPayment, setNewPayment] = useState({
    amount: '',
    paymentMethod: 'UPI',
    paymentType: 'PARTIAL',
    transactionReference: '',
    notes: 'Payment collected at Front Desk',
  });

  // Extend form
  const [extendDate, setExtendDate] = useState('');

  // Share form
  const [shareChannel, setShareChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [shareRecipient, setShareRecipient] = useState('');

  const fetchStay = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/stays/${stayId}`);
      setStay(data);
      if (data?.expectedCheckOutTime) {
        const currentExp = new Date(data.expectedCheckOutTime);
        currentExp.setDate(currentExp.getDate() + 1);
        setExtendDate(currentExp.toISOString().split('T')[0]);
      }
      if (data?.guest?.email) {
        setShareRecipient(data.guest.email);
      }
    } catch (err: any) {
      toast.error('Failed to load stay folio: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stayId) {
      fetchStay();
    }
  }, [stayId]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [cats, items] = await Promise.all([
          apiRequest('/catalog/categories'),
          apiRequest('/catalog/items'),
        ]);
        setCategories(cats || []);
        setServiceItems(items || []);
        if (cats && cats.length > 0) {
          setNewCharge((prev) => ({
            ...prev,
            categoryId: cats[0].id,
            taxPercent: Number(cats[0].taxRatePercent) || 5,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadCatalog();
  }, []);

  // Post New Charge
  const handleAddCharge = async () => {
    if (!newCharge.description || Number(newCharge.unitPrice) <= 0) {
      toast.error('Please enter description and unit price');
      return;
    }
    try {
      await apiRequest(`/stays/${stayId}/charges`, {
        method: 'POST',
        body: JSON.stringify(newCharge),
      });
      toast.success('Charge successfully posted to folio');
      setChargeModalOpen(false);
      setNewCharge({
        categoryId: categories[0]?.id || '',
        serviceItemId: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxPercent: 5,
        discountAmount: 0,
      });
      fetchStay();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add charge');
    }
  };

  // Void Charge
  const handleVoidCharge = async (chargeId: string) => {
    const reason = prompt('Please enter authorized reason for voiding this charge:');
    if (!reason) return;

    try {
      await apiRequest(`/stays/charges/${chargeId}/void`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      toast.success('Charge voided and reversed');
      fetchStay();
    } catch (err: any) {
      toast.error(err.message || 'Failed to void charge');
    }
  };

  // Record Payment
  const handleRecordPayment = async () => {
    if (!newPayment.amount || Number(newPayment.amount) <= 0) {
      toast.error('Please enter valid payment amount');
      return;
    }
    try {
      await apiRequest('/billing/payments', {
        method: 'POST',
        body: JSON.stringify({
          stayId,
          ...newPayment,
          amount: Number(newPayment.amount),
        }),
      });
      toast.success('Payment recorded successfully');
      setPaymentModalOpen(false);
      setNewPayment({
        amount: '',
        paymentMethod: 'UPI',
        paymentType: 'PARTIAL',
        transactionReference: '',
        notes: '',
      });
      fetchStay();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payment');
    }
  };

  // Extend Stay
  const handleExtendStay = async () => {
    if (!extendDate) return;
    try {
      await apiRequest(`/stays/${stayId}/extend`, {
        method: 'POST',
        body: JSON.stringify({ newCheckOutTime: new Date(extendDate).toISOString() }),
      });
      toast.success('Stay extended successfully');
      setExtendModalOpen(false);
      fetchStay();
    } catch (err: any) {
      toast.error(err.message || 'Failed to extend stay');
    }
  };

  // Generate Invoice
  const handleGenerateInvoice = async () => {
    try {
      const invoice = await apiRequest('/billing/invoices/generate', {
        method: 'POST',
        body: JSON.stringify({ stayId }),
      });
      toast.success(`Invoice #${invoice.invoiceNumber} generated!`);
      fetchStay();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate invoice');
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    const invoice = stay?.invoices?.[0];
    if (!invoice) {
      toast.error('Please generate an invoice before downloading PDF');
      return;
    }

    const token = localStorage.getItem('rivanta_token');
    const url = `http://localhost:4000/api/billing/invoices/${invoice.id}/pdf`;

    window.open(url, '_blank');
  };

  // Share Invoice
  const handleShareInvoice = async () => {
    const invoice = stay?.invoices?.[0];
    if (!invoice) {
      toast.error('Invoice must be generated first');
      return;
    }
    try {
      const res = await apiRequest(`/billing/invoices/${invoice.id}/share`, {
        method: 'POST',
        body: JSON.stringify({
          channel: shareChannel,
          recipient: shareRecipient,
        }),
      });

      if (res.status === 'UNCONFIGURED_PROVIDER') {
        toast.warning(res.message);
      } else {
        toast.success(res.message);
      }
      setShareModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to share invoice');
    }
  };

  // Process Checkout
  const handleCompleteCheckout = async (forceUnpaid = false) => {
    try {
      // First ensure invoice is generated
      await apiRequest('/billing/invoices/generate', {
        method: 'POST',
        body: JSON.stringify({ stayId }),
      });

      // Complete checkout
      await apiRequest(`/stays/${stayId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ forceUnpaid }),
      });

      toast.success(`Room ${stay.room?.roomNumber || '—'} checkout completed! Room marked for turnover cleaning.`);
      setCheckoutModalOpen(false);
      fetchStay();
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="py-24 text-center text-xs text-[#94A3B8]">Loading stay folio records...</div>
      </DashboardShell>
    );
  }

  if (!stay) {
    return (
      <DashboardShell>
        <div className="py-24 text-center text-xs text-[#DC2626]">Stay record not found</div>
      </DashboardShell>
    );
  }

  const isCompleted = stay.status === 'COMPLETED';
  const outstanding = stay.folio?.outstandingBalance || 0;

  return (
    <DashboardShell>
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#111827]">
              Guest Folio #{stay.stayNumber}
            </h1>
            <Badge variant={isCompleted ? 'neutral' : 'info'}>
              {stay.status}
            </Badge>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Room {stay.room?.roomNumber || '—'} ({stay.room?.roomType?.name || (typeof stay.room?.roomType === 'string' ? stay.room.roomType : 'Standard Room')}) | {stay.guest?.fullName || (stay.guest ? `${stay.guest.firstName || ''} ${stay.guest.lastName || ''}`.trim() : 'Guest')} | Check-in: {new Date(stay.checkInTime || stay.createdAt || Date.now()).toLocaleDateString('en-IN')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!isCompleted && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExtendModalOpen(true)}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                Extend Stay
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setChargeModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Post Charge
              </Button>
              <Button
                size="sm"
                variant="accent"
                onClick={() => {
                  setNewPayment((prev) => ({
                    ...prev,
                    amount: outstanding > 0 ? String(outstanding) : '',
                  }));
                  setPaymentModalOpen(true);
                }}
                leftIcon={<CreditCard className="w-3.5 h-3.5" />}
              >
                Collect Payment
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setCheckoutModalOpen(true)}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Process Checkout
              </Button>
            </>
          )}

          {/* Invoice Generation & PDF */}
          <Button
            size="sm"
            variant="primary"
            onClick={stay.invoices?.length > 0 ? handleDownloadPdf : handleGenerateInvoice}
            leftIcon={<Receipt className="w-3.5 h-3.5" />}
          >
            {stay.invoices?.length > 0 ? 'Print / PDF Invoice' : 'Generate Invoice'}
          </Button>

          {stay.invoices?.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShareModalOpen(true)}
              leftIcon={<Share2 className="w-3.5 h-3.5" />}
            >
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Financial Settlement Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4!">
          <span className="text-xs font-semibold text-[#64748B]">Total Charges (Tariff + Services)</span>
          <p className="text-xl font-bold text-[#111827] mt-1">₹{Number(stay.folio?.totalCharges || 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-[#64748B]">Taxes included: ₹{Number(stay.folio?.taxTotal || 0).toLocaleString('en-IN')}</p>
        </Card>

        <Card className="p-4!">
          <span className="text-xs font-semibold text-[#15803D]">Payments Received</span>
          <p className="text-xl font-bold text-[#15803D] mt-1">₹{Number(stay.folio?.totalPayments || 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-[#64748B]">{stay.payments?.length || 0} transaction(s)</p>
        </Card>

        <Card className="p-4!">
          <span className="text-xs font-semibold text-[#D97706]">Refunds Issued</span>
          <p className="text-xl font-bold text-[#D97706] mt-1">₹{Number(stay.folio?.totalRefunds || 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-[#64748B]">{stay.refunds?.length || 0} refund(s)</p>
        </Card>

        <Card className="p-4! border-blue-200 bg-blue-50/50">
          <span className="text-xs font-bold text-[#172554]">Outstanding Balance</span>
          <p className={`text-xl font-black mt-1 ${outstanding > 0 ? 'text-[#DC2626]' : 'text-[#15803D]'}`}>
            ₹{outstanding.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#64748B]">
            {outstanding <= 0.01 ? 'Fully settled & clear' : 'Payment required before checkout'}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Itemized Charges Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Itemized Folio Ledger"
              subtitle="All room night tariffs, dining, laundry, bar, and amenities"
              action={
                !isCompleted && (
                  <Button size="sm" variant="outline" onClick={() => setChargeModalOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add Line Item
                  </Button>
                )
              }
            />

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right">Rate (₹)</th>
                    <th className="pb-3 text-right">Tax (₹)</th>
                    <th className="pb-3 text-right">Total (₹)</th>
                    {!isCompleted && <th className="pb-3 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {stay.charges.map((c: any) => (
                    <tr key={c.id} className={c.isVoided ? 'opacity-40 line-through bg-gray-50' : ''}>
                      <td className="py-3 font-medium text-[#111827]">
                        {c.description}
                        {c.isVoided && <span className="ml-2 text-[10px] text-red-600 no-underline font-bold">[VOIDED: {c.voidReason}]</span>}
                      </td>
                      <td className="py-3">
                        <Badge variant="neutral" size="sm">{c.category?.name || 'General'}</Badge>
                      </td>
                      <td className="py-3 text-center font-mono">{c.quantity}</td>
                      <td className="py-3 text-right font-mono">₹{Number(c.unitPrice).toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-mono">₹{Number(c.taxAmount).toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-mono font-bold text-[#172554]">
                        ₹{Number(c.totalAmount).toLocaleString('en-IN')}
                      </td>
                      {!isCompleted && (
                        <td className="py-3 text-center">
                          {!c.isVoided && (
                            <button
                              onClick={() => handleVoidCharge(c.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded"
                              title="Void Charge"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Payment Transactions Table */}
          <Card>
            <CardHeader
              title="Payment Receipts & Transactions"
              subtitle="Cash, UPI, and credit card payments posted to this folio"
              action={
                !isCompleted && (
                  <Button size="sm" variant="accent" onClick={() => setPaymentModalOpen(true)} leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
                    Collect Payment
                  </Button>
                )
              }
            />

            {stay.payments.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-4 text-center">No payments recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                      <th className="pb-3">Receipt #</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">Reference</th>
                      <th className="pb-3">Collected By</th>
                      <th className="pb-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {stay.payments.map((p: any) => (
                      <tr key={p.id}>
                        <td className="py-3 font-mono font-bold text-[#172554]">{p.paymentNumber}</td>
                        <td className="py-3 text-[#64748B]">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
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
        </div>

        {/* Right Col: Guest & Stay Details & Signature */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Guest Information" subtitle="Profile and contact details" />
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#94A3B8]">Full Name:</span>
                <p className="font-bold text-[#111827] text-sm">{stay.guest?.fullName || (stay.guest ? `${stay.guest.firstName || ''} ${stay.guest.lastName || ''}`.trim() : 'Guest')}</p>
              </div>
              <div>
                <span className="text-[#94A3B8]">Phone Number:</span>
                <p className="font-semibold text-[#111827]">{stay.guest.phone}</p>
              </div>
              {stay.guest.email && (
                <div>
                  <span className="text-[#94A3B8]">Email Address:</span>
                  <p className="text-[#111827]">{stay.guest.email}</p>
                </div>
              )}
              <div>
                <span className="text-[#94A3B8]">Govt ID ({stay.guest.idType}):</span>
                <p className="font-mono text-[#111827]">{stay.guest.idNumber}</p>
              </div>
              <div>
                <span className="text-[#94A3B8]">Booking Attribution:</span>
                <p className="font-semibold text-[#0F766E]">{stay.bookingSource?.name}</p>
                {stay.externalBookingRef && (
                  <p className="font-mono text-[10px] text-[#64748B]">Ref: {stay.externalBookingRef}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Digital Signature Card */}
          <Card>
            <CardHeader title="Guest Digital Declaration" subtitle="Captured upon check-in registration" />
            {stay.declarationAcceptances?.[0]?.signatureUrl ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                  <img
                    src={stay.declarationAcceptances[0].signatureUrl}
                    alt="Guest Signature"
                    className="max-h-24 max-w-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-[#64748B] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Signed at check-in on {new Date(stay.declarationAcceptances[0].signedAt).toLocaleString('en-IN')}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8] italic">No signature on file for this stay</p>
            )}
          </Card>

          {/* Quick Invoice Card */}
          {stay.invoices?.[0] && (
            <Card className="border-teal-200 bg-teal-50/40">
              <div className="flex items-center justify-between pb-2 border-b border-teal-100">
                <span className="text-xs font-bold text-teal-900">Tax Invoice Generated</span>
                <Badge variant="accent" size="sm">{stay.invoices[0].status}</Badge>
              </div>
              <div className="pt-2 text-xs text-teal-950 space-y-1">
                <p className="font-mono font-bold">{stay.invoices[0].invoiceNumber}</p>
                <p className="text-[11px] text-teal-800">
                  Total: ₹{Number(stay.invoices[0].totalAmount).toLocaleString('en-IN')} | Paid: ₹{Number(stay.invoices[0].paidAmount).toLocaleString('en-IN')}
                </p>
                <div className="pt-2 flex gap-2">
                  <Button size="sm" variant="accent" className="w-full text-xs" onClick={handleDownloadPdf} leftIcon={<Download className="w-3 h-3" />}>
                    Download PDF
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* MODAL: POST CHARGE */}
      <Modal isOpen={chargeModalOpen} onClose={() => setChargeModalOpen(false)} title="Post Charge to Guest Folio" subtitle="Add room service, dining, bar, or laundry charge" maxWidth="md">
        <div className="space-y-4">
          <Select
            label="Service Category"
            value={newCharge.categoryId}
            onChange={(e) => {
              const cat = categories.find((c) => c.id === e.target.value);
              setNewCharge({
                ...newCharge,
                categoryId: e.target.value,
                taxPercent: cat ? Number(cat.taxRatePercent) : 5,
              });
            }}
            options={categories.map((c) => ({
              label: `${c.name} (${c.taxRatePercent}% Tax)`,
              value: c.id,
            }))}
          />

          {/* Quick Item Picker from Catalog */}
          <div>
            <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
              Pick from Menu / Service Catalog (Optional)
            </label>
            <select
              className="w-full bg-white rounded-lg border border-[#CBD5E1] text-xs text-[#111827] p-2.5"
              onChange={(e) => {
                const item = serviceItems.find((s) => s.id === e.target.value);
                if (item) {
                  setNewCharge({
                    ...newCharge,
                    serviceItemId: item.id,
                    description: item.name,
                    unitPrice: Number(item.unitPrice),
                    taxPercent: Number(item.taxPercent) || 5,
                  });
                }
              }}
            >
              <option value="">-- Choose item --</option>
              {serviceItems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (₹{s.unitPrice})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Charge Description"
            required
            value={newCharge.description}
            onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
            placeholder="e.g. In-Room Dining: Paneer Butter Masala"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={newCharge.quantity}
              onChange={(e) => setNewCharge({ ...newCharge, quantity: Number(e.target.value) })}
            />
            <Input
              label="Unit Price (₹)"
              type="number"
              value={newCharge.unitPrice}
              onChange={(e) => setNewCharge({ ...newCharge, unitPrice: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tax Rate (%)"
              type="number"
              value={newCharge.taxPercent}
              onChange={(e) => setNewCharge({ ...newCharge, taxPercent: Number(e.target.value) })}
            />
            <Input
              label="Discount (₹)"
              type="number"
              value={newCharge.discountAmount}
              onChange={(e) => setNewCharge({ ...newCharge, discountAmount: Number(e.target.value) })}
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs flex justify-between font-bold text-[#172554]">
            <span>Calculated Charge:</span>
            <span>
              ₹
              {(
                newCharge.quantity * newCharge.unitPrice -
                newCharge.discountAmount +
                ((newCharge.quantity * newCharge.unitPrice - newCharge.discountAmount) * newCharge.taxPercent) / 100
              ).toFixed(2)}
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setChargeModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAddCharge}>Post Charge</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: COLLECT PAYMENT */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Collect Payment" subtitle="Record front desk cash, UPI, or card payment" maxWidth="md">
        <div className="space-y-4">
          <Input
            label="Amount to Collect (₹)"
            type="number"
            required
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
            placeholder="0.00"
            helperText={`Current outstanding: ₹${outstanding.toLocaleString('en-IN')}`}
          />

          <Select
            label="Payment Method"
            value={newPayment.paymentMethod}
            onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value })}
            options={[
              { label: 'UPI (QR Code / GPay / PhonePe)', value: 'UPI' },
              { label: 'Cash at Front Desk', value: 'CASH' },
              { label: 'Credit / Debit Card', value: 'CARD' },
              { label: 'Bank Transfer / NEFT', value: 'BANK_TRANSFER' },
              { label: 'Other', value: 'OTHER' },
            ]}
          />

          <Input
            label="Transaction Reference / Authorization Code"
            value={newPayment.transactionReference}
            onChange={(e) => setNewPayment({ ...newPayment, transactionReference: e.target.value })}
            placeholder="e.g. UPI-998811 or Card Auth #4412"
          />

          <Input
            label="Payment Notes"
            value={newPayment.notes}
            onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
            <Button variant="accent" size="sm" onClick={handleRecordPayment}>Confirm & Post Receipt</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: EXTEND STAY */}
      <Modal isOpen={extendModalOpen} onClose={() => setExtendModalOpen(false)} title="Extend Guest Stay" subtitle="Check room retention and add additional nights" maxWidth="md">
        <div className="space-y-4">
          <Input
            label="New Check-Out Date"
            type="date"
            required
            value={extendDate}
            onChange={(e) => setExtendDate(e.target.value)}
          />
          <p className="text-xs text-[#64748B]">
            Current checkout date: {new Date(stay.expectedCheckOutTime).toLocaleDateString('en-IN')}. Extending the stay will automatically verify room conflict and append nightly tariff charges.
          </p>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setExtendModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleExtendStay}>Confirm Extension</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: PROCESS CHECKOUT */}
      <Modal isOpen={checkoutModalOpen} onClose={() => setCheckoutModalOpen(false)} title="Guided Guest Checkout" subtitle="Verify billing balance, finalize invoice, and release room" maxWidth="md">
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between font-bold text-sm text-[#172554]">
              <span>Settlement Summary</span>
              <span>Room {stay.room?.roomNumber || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Total Charges:</span>
              <span className="font-mono font-bold">₹{Number(stay.folio?.totalCharges || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Total Payments:</span>
              <span className="font-mono font-bold text-emerald-700">₹{Number(stay.folio?.totalPayments || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
              <span>Balance Remaining:</span>
              <span className={`font-mono ${outstanding > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ₹{outstanding.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {outstanding > 0.01 ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <p className="font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-red-600" /> Outstanding balance remaining!
              </p>
              <p className="mt-1 text-[11px]">
                Please collect the remaining balance of ₹{outstanding.toLocaleString('en-IN')} or obtain managerial override.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => {
                    setCheckoutModalOpen(false);
                    setNewPayment((prev) => ({ ...prev, amount: String(outstanding) }));
                    setPaymentModalOpen(true);
                  }}
                >
                  Collect ₹{outstanding.toLocaleString('en-IN')} Now
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleCompleteCheckout(true)}>
                  Manager Override Checkout
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
              <p className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Folio is fully settled!
              </p>
              <p className="mt-1 text-[11px]">
                Ready to finalize checkout. Room {stay.room?.roomNumber || '—'} will be marked for turnover cleaning.
              </p>
              <div className="mt-3">
                <Button size="md" variant="primary" className="w-full" onClick={() => handleCompleteCheckout(false)}>
                  Finalize & Complete Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL: SHARE INVOICE */}
      <Modal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} title="Share Tax Invoice" subtitle="Transmit via Email or WhatsApp" maxWidth="sm">
        <div className="space-y-4">
          <Select
            label="Channel"
            value={shareChannel}
            onChange={(e) => setShareChannel(e.target.value as any)}
            options={[
              { label: 'Email (PDF attachment)', value: 'EMAIL' },
              { label: 'WhatsApp (Instant link)', value: 'WHATSAPP' },
            ]}
          />
          <Input
            label={shareChannel === 'EMAIL' ? 'Recipient Email' : 'Recipient WhatsApp Phone'}
            required
            value={shareRecipient}
            onChange={(e) => setShareRecipient(e.target.value)}
            placeholder={shareChannel === 'EMAIL' ? 'guest@example.com' : '+91 98200 00000'}
          />
          <p className="text-[11px] text-[#64748B]">
            * Note: Live external provider credentials (SMTP / Twilio) are verified before dispatch.
          </p>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShareModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleShareInvoice}>Send Invoice</Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}

export default function StayBillingFolioPage() {
  return (
    <React.Suspense fallback={<DashboardShell><div className="py-24 text-center text-xs text-[#94A3B8]">Loading stay folio...</div></DashboardShell>}>
      <StayBillingFolioContent />
    </React.Suspense>
  );
}
