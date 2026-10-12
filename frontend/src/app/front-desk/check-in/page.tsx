'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { SignatureCanvas } from '@/components/ui/SignatureCanvas';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import {
  User,
  Calendar,
  Layers,
  CreditCard,
  FileSignature,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
} from 'lucide-react';
import { addDays, format, differenceInCalendarDays } from 'date-fns';

export default function GuestCheckInPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Reference Data
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [bookingSources, setBookingSources] = useState<any[]>([]);
  const [declaration, setDeclaration] = useState<any>(null);

  // Form State
  // Step 1: Guest Identity
  const [guestData, setGuestData] = useState({
    id: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400076',
    country: 'India',
    nationality: 'Indian',
    idType: 'AADHAAR',
    idNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    isVip: false,
  });

  const [stayData, setStayData] = useState({
    checkInTime: '',
    expectedCheckOutTime: '',
    roomTypeId: '',
    roomId: '',
    adultsCount: 2,
    childrenCount: 0,
    ratePerNight: 0,
    specialRequests: '',
    staffNotes: '',
  });

  // Step 3: Booking Source Attribution
  const [bookingSourceData, setBookingSourceData] = useState({
    bookingSourceId: '',
    externalBookingRef: '',
    partnerCommissionAmount: '',
    partnerCollectedAmount: '',
    paymentResponsibility: 'GUEST',
  });

  // Step 4: Advance Payment
  const [advancePayment, setAdvancePayment] = useState({
    amount: '',
    paymentMethod: 'CASH',
    transactionReference: '',
    notes: 'Advance collected at front desk check-in',
  });

  // Step 5: Declaration & Digital Signature
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState('');

  // Duplicate Guest Detection
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);

  // Load initial reference data
  useEffect(() => {
    const initData = async () => {
      try {
        const [rtRes, bsRes, decRes] = await Promise.all([
          apiRequest('/room-types'),
          apiRequest('/catalog/booking-sources'),
          apiRequest('/hotel/settings'),
        ]);

        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        const tomorrowStr = format(addDays(now, 1), 'yyyy-MM-dd');

        setRoomTypes(rtRes || []);
        setBookingSources(bsRes || []);
        setDeclaration(decRes?.activeDeclaration || null);

        setStayData((prev) => ({
          ...prev,
          checkInTime: todayStr,
          expectedCheckOutTime: tomorrowStr,
          roomTypeId: rtRes?.[0]?.id || '',
          ratePerNight: rtRes?.[0] ? Number(rtRes[0].basePrice) : 0,
        }));

        if (bsRes && bsRes.length > 0) {
          const walkIn = bsRes.find((b: any) => b.code === 'WALK_IN');
          setBookingSourceData((prev) => ({
            ...prev,
            bookingSourceId: walkIn ? walkIn.id : bsRes[0].id,
          }));
        }
      } catch (err: any) {
        toast.error('Failed to load initial configuration: ' + err.message);
      }
    };
    initData();
  }, []);

  // Fetch available rooms whenever dates or roomType changes
  useEffect(() => {
    const fetchRooms = async () => {
      if (!stayData.checkInTime || !stayData.expectedCheckOutTime) return;
      try {
        const rooms = await apiRequest(
          `/rooms/availability?checkIn=${stayData.checkInTime}&checkOut=${stayData.expectedCheckOutTime}&roomTypeId=${stayData.roomTypeId}`
        );
        const roomsList = Array.isArray(rooms) ? rooms : [];
        setAvailableRooms(roomsList);
        if (roomsList.length > 0) {
          setStayData((prev) => ({ ...prev, roomId: roomsList[0].id }));
        } else {
          setStayData((prev) => ({ ...prev, roomId: '' }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRooms();
  }, [stayData.checkInTime, stayData.expectedCheckOutTime, stayData.roomTypeId]);

  // Check duplicate guests on phone input blur
  const handlePhoneBlur = async () => {
    if (!guestData.phone || guestData.phone.length < 8) return;
    try {
      const matches = await apiRequest(`/guests/check-duplicate?phone=${encodeURIComponent(guestData.phone)}`);
      setDuplicateMatches(matches || []);
    } catch {
      // ignore
    }
  };

  const useExistingGuest = (guest: any) => {
    setGuestData({
      id: guest.id,
      fullName: guest.fullName,
      phone: guest.phone,
      email: guest.email || '',
      address: guest.address || '',
      city: guest.city || 'Mumbai',
      state: guest.state || 'Maharashtra',
      postalCode: guest.postalCode || '400076',
      country: guest.country || 'India',
      nationality: guest.nationality || 'Indian',
      idType: guest.idType || 'AADHAAR',
      idNumber: guest.idNumber,
      emergencyContactName: '',
      emergencyContactPhone: '',
      isVip: guest.isVip,
    });
    setDuplicateMatches([]);
    toast.success(`Populated guest profile for ${guest.fullName}`);
  };

  // Date difference calculation
  const nights = Math.max(
    1,
    differenceInCalendarDays(new Date(stayData.expectedCheckOutTime), new Date(stayData.checkInTime))
  );

  const estimatedTariff = nights * Number(stayData.ratePerNight);
  const estimatedTax = Number((estimatedTariff * 0.12).toFixed(2));
  const estimatedTotal = estimatedTariff + estimatedTax;

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!guestData.fullName || !guestData.phone || !guestData.idNumber) {
        toast.error('Please enter Guest Full Name, Mobile Phone, and Government ID number');
        return false;
      }
    }
    if (step === 2) {
      if (!stayData.roomId) {
        toast.error('Please select an available room for check-in');
        return false;
      }
      if (nights <= 0) {
        toast.error('Check-out date must be after check-in date');
        return false;
      }
    }
    if (step === 3) {
      if (!bookingSourceData.bookingSourceId) {
        toast.error('Please select a booking source');
        return false;
      }
    }
    if (step === 5) {
      if (!declarationAccepted) {
        toast.error('Guest must accept the Hotel Stay Agreement & House Rules');
        return false;
      }
      if (!signatureUrl) {
        toast.error('Digital signature is required to complete check-in');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Final Submission
  const handleSubmitCheckIn = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    try {
      const payload = {
        guestData,
        stayData: {
          ...stayData,
          checkInTime: new Date(stayData.checkInTime).toISOString(),
          expectedCheckOutTime: new Date(stayData.expectedCheckOutTime).toISOString(),
        },
        bookingSourceData,
        advancePayment: advancePayment.amount ? advancePayment : null,
        declarationAcceptance: {
          signatureUrl,
        },
      };

      const createdStay = await apiRequest('/stays/check-in', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success(`Check-in complete! Stay reference #${createdStay.stayNumber}`);
      router.push(`/front-desk/billing/${createdStay.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Guest Identity', icon: User },
    { num: 2, title: 'Stay & Room', icon: Calendar },
    { num: 3, title: 'Booking Source', icon: Layers },
    { num: 4, title: 'Advance Payment', icon: CreditCard },
    { num: 5, title: 'Review & Sign', icon: FileSignature },
  ];

  return (
    <DashboardShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Guest Check-in & Registration</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          5-Step guest registration workflow with live room assignment and digital signature
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-8 shadow-xs">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                      isCompleted
                        ? 'bg-[#15803D] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#172554] text-white ring-4 ring-blue-100 shadow-sm'
                        : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-2 ${
                      isCurrent ? 'text-[#172554]' : 'text-[#64748B]'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition-colors ${
                      currentStep > idx + 1 ? 'bg-[#15803D]' : 'bg-[#E2E8F0]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Wizard Step Body */}
      <Card className="max-w-4xl mx-auto p-6 md:p-8">
        {/* STEP 1: GUEST IDENTITY */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <CardHeader
              title="Step 1: Guest Identity & Government ID"
              subtitle="Capture legal guest identification and contact details"
            />

            {/* Duplicate Notice */}
            {duplicateMatches.length > 0 && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0F766E]" /> Existing Guest Profile Found!
                </p>
                <p className="mt-1 text-teal-700">We found a past guest matching this phone number. Click to auto-fill:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {duplicateMatches.map((m) => (
                    <Button key={m.id} size="sm" variant="accent" onClick={() => useExistingGuest(m)}>
                      Use {m.fullName} ({m.phone})
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                required
                value={guestData.fullName}
                onChange={(e) => setGuestData({ ...guestData, fullName: e.target.value })}
                placeholder="e.g. Aarav Mehta"
              />

              <Input
                label="Mobile Number (with country code)"
                required
                value={guestData.phone}
                onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                onBlur={handlePhoneBlur}
                placeholder="+91 98200 00000"
              />

              <Input
                label="Email Address"
                type="email"
                value={guestData.email}
                onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                placeholder="guest@example.com"
              />

              <div className="grid grid-cols-2 gap-2">
                <Select
                  label="Govt ID Type"
                  value={guestData.idType}
                  onChange={(e) => setGuestData({ ...guestData, idType: e.target.value })}
                  options={[
                    { label: 'Aadhaar Card', value: 'AADHAAR' },
                    { label: 'Passport', value: 'PASSPORT' },
                    { label: 'Driving License', value: 'DRIVING_LICENSE' },
                    { label: 'National ID Card', value: 'NATIONAL_ID' },
                    { label: 'Voter ID', value: 'VOTER_ID' },
                    { label: 'Other', value: 'OTHER' },
                  ]}
                />
                <Input
                  label="ID Number"
                  required
                  value={guestData.idNumber}
                  onChange={(e) => setGuestData({ ...guestData, idNumber: e.target.value })}
                  placeholder="ID Number"
                />
              </div>

              <Input
                label="Residential Address"
                value={guestData.address}
                onChange={(e) => setGuestData({ ...guestData, address: e.target.value })}
                placeholder="Flat / Street / Area"
              />

              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="City"
                  value={guestData.city}
                  onChange={(e) => setGuestData({ ...guestData, city: e.target.value })}
                />
                <Input
                  label="State"
                  value={guestData.state}
                  onChange={(e) => setGuestData({ ...guestData, state: e.target.value })}
                />
                <Input
                  label="Postal Code"
                  value={guestData.postalCode}
                  onChange={(e) => setGuestData({ ...guestData, postalCode: e.target.value })}
                />
              </div>

              <Input
                label="Emergency Contact Name"
                value={guestData.emergencyContactName}
                onChange={(e) => setGuestData({ ...guestData, emergencyContactName: e.target.value })}
                placeholder="Contact Person"
              />

              <Input
                label="Emergency Phone"
                value={guestData.emergencyContactPhone}
                onChange={(e) => setGuestData({ ...guestData, emergencyContactPhone: e.target.value })}
                placeholder="+91 98200 99999"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isVip"
                checked={guestData.isVip}
                onChange={(e) => setGuestData({ ...guestData, isVip: e.target.checked })}
                className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E]"
              />
              <label htmlFor="isVip" className="text-xs font-semibold text-[#111827] cursor-pointer">
                Mark as VIP Guest (Elevated Service & Front Desk Priority)
              </label>
            </div>
          </div>
        )}

        {/* STEP 2: STAY & ROOM INFORMATION */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <CardHeader
              title="Step 2: Stay Dates & Room Assignment"
              subtitle="Select dates and pick an available clean room"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Check-In Date"
                type="date"
                required
                value={stayData.checkInTime}
                onChange={(e) => setStayData({ ...stayData, checkInTime: e.target.value })}
              />

              <Input
                label="Expected Check-Out Date"
                type="date"
                required
                value={stayData.expectedCheckOutTime}
                onChange={(e) => setStayData({ ...stayData, expectedCheckOutTime: e.target.value })}
              />

              <Select
                label="Room Category"
                value={stayData.roomTypeId}
                onChange={(e) => {
                  const selected = roomTypes.find((r) => r.id === e.target.value);
                  setStayData({
                    ...stayData,
                    roomTypeId: e.target.value,
                    ratePerNight: selected ? Number(selected.basePrice) : stayData.ratePerNight,
                  });
                }}
                options={roomTypes.map((rt) => ({
                  label: `${rt.name} (Base ₹${Number(rt.basePrice).toLocaleString('en-IN')}/night)`,
                  value: rt.id,
                }))}
              />

              <div>
                <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
                  Assigned Room Number <span className="text-red-500">*</span>
                </label>
                {!Array.isArray(availableRooms) || availableRooms.length === 0 ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    No clean available rooms in this category for the selected dates.
                  </div>
                ) : (
                  <select
                    className="w-full bg-white rounded-lg border border-[#CBD5E1] text-sm text-[#111827] px-3.5 py-2.5 focus:ring-2 focus:ring-[#172554] focus:outline-none"
                    value={stayData.roomId}
                    onChange={(e) => setStayData({ ...stayData, roomId: e.target.value })}
                  >
                    {availableRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} (Floor {r.floor}) - {r.housekeepingStatus}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Adults"
                  type="number"
                  min="1"
                  value={stayData.adultsCount}
                  onChange={(e) => setStayData({ ...stayData, adultsCount: Number(e.target.value) })}
                />
                <Input
                  label="Children"
                  type="number"
                  min="0"
                  value={stayData.childrenCount}
                  onChange={(e) => setStayData({ ...stayData, childrenCount: Number(e.target.value) })}
                />
              </div>

              <Input
                label="Rate Per Night (₹)"
                type="number"
                value={stayData.ratePerNight}
                onChange={(e) => setStayData({ ...stayData, ratePerNight: Number(e.target.value) })}
                helperText={`Total nights: ${nights} | Base tariff: ₹${estimatedTariff.toLocaleString('en-IN')}`}
              />

              <div className="md:col-span-2">
                <Input
                  label="Special Requests / Preferences"
                  value={stayData.specialRequests}
                  onChange={(e) => setStayData({ ...stayData, specialRequests: e.target.value })}
                  placeholder="e.g. High floor, extra pillows, early airport taxi"
                />
              </div>
            </div>

            {/* Estimated Rate Summary Box */}
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-blue-950">
              <div>
                <p className="font-bold text-sm">Stay Duration: {nights} Night(s)</p>
                <p className="text-[#64748B]">Applicable room GST: 12%</p>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-[#172554]">Est. Total: ₹{estimatedTotal.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-[#64748B]">Tariff: ₹{estimatedTariff.toLocaleString('en-IN')} + Tax: ₹{estimatedTax.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BOOKING SOURCE ATTRIBUTION */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <CardHeader
              title="Step 3: Booking Source Attribution"
              subtitle="Track booking origin (Direct, Agoda, MakeMyTrip, Corporate, etc.)"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Booking Source Channel"
                value={bookingSourceData.bookingSourceId}
                onChange={(e) => setBookingSourceData({ ...bookingSourceData, bookingSourceId: e.target.value })}
                options={bookingSources.map((bs) => ({
                  label: `${bs.name} ${!bs.isDirect ? `(${bs.commissionRate}% Commission)` : '(Direct)'}`,
                  value: bs.id,
                }))}
              />

              <Input
                label="External Booking Reference"
                value={bookingSourceData.externalBookingRef}
                onChange={(e) => setBookingSourceData({ ...bookingSourceData, externalBookingRef: e.target.value })}
                placeholder="e.g. MMT-891244 or AGODA-7712"
                helperText="Provided by OTA or corporate booking voucher"
              />

              <Input
                label="Partner Commission Amount (₹)"
                type="number"
                value={bookingSourceData.partnerCommissionAmount}
                onChange={(e) => setBookingSourceData({ ...bookingSourceData, partnerCommissionAmount: e.target.value })}
                placeholder="0"
                helperText="Internal accounting tracking"
              />

              <Input
                label="Amount Collected by Partner (₹)"
                type="number"
                value={bookingSourceData.partnerCollectedAmount}
                onChange={(e) => setBookingSourceData({ ...bookingSourceData, partnerCollectedAmount: e.target.value })}
                placeholder="0"
                helperText="If prepaid online by guest to the partner"
              />

              <Select
                label="Payment Responsibility"
                value={bookingSourceData.paymentResponsibility}
                onChange={(e) => setBookingSourceData({ ...bookingSourceData, paymentResponsibility: e.target.value })}
                options={[
                  { label: 'Guest Pays Hotel Directly', value: 'GUEST' },
                  { label: 'Partner Settles with Hotel (Voucher/BTC)', value: 'PARTNER' },
                ]}
              />
            </div>
          </div>
        )}

        {/* STEP 4: ADVANCE PAYMENT */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <CardHeader
              title="Step 4: Advance Payment Collection"
              subtitle="Record initial deposit or advance payment (Optional)"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Advance Payment Amount (₹)"
                type="number"
                value={advancePayment.amount}
                onChange={(e) => setAdvancePayment({ ...advancePayment, amount: e.target.value })}
                placeholder="e.g. 5000 (Enter 0 or leave empty if no advance)"
              />

              <Select
                label="Payment Method"
                value={advancePayment.paymentMethod}
                onChange={(e) => setAdvancePayment({ ...advancePayment, paymentMethod: e.target.value })}
                options={[
                  { label: 'Cash', value: 'CASH' },
                  { label: 'UPI (QR / GPay / PhonePe)', value: 'UPI' },
                  { label: 'Credit / Debit Card', value: 'CARD' },
                  { label: 'Bank Transfer / NEFT', value: 'BANK_TRANSFER' },
                  { label: 'Other', value: 'OTHER' },
                ]}
              />

              <Input
                label="Transaction / Authorization Reference"
                value={advancePayment.transactionReference}
                onChange={(e) => setAdvancePayment({ ...advancePayment, transactionReference: e.target.value })}
                placeholder="e.g. UPI-TXN-998811 or Card Approval Code"
              />

              <Input
                label="Payment Notes"
                value={advancePayment.notes}
                onChange={(e) => setAdvancePayment({ ...advancePayment, notes: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW, DECLARATION & DIGITAL SIGNATURE */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <CardHeader
              title="Step 5: Review, Declaration & Digital Signature"
              subtitle="Verify all parameters and capture guest digital signature"
            />

            {/* Registration Summary Card */}
            <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs space-y-2">
              <div className="flex justify-between border-b border-[#E2E8F0] pb-2 font-bold text-sm text-[#172554]">
                <span>Registration Summary</span>
                <span>Room {availableRooms.find((r) => r.id === stayData.roomId)?.roomNumber || 'Assigned'}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[#475569]">
                <div>
                  <span className="text-[#94A3B8]">Guest:</span> <strong className="text-[#111827]">{guestData.fullName}</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Phone:</span> <strong className="text-[#111827]">{guestData.phone}</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Dates:</span> <strong className="text-[#111827]">{stayData.checkInTime} to {stayData.expectedCheckOutTime}</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Nights:</span> <strong className="text-[#111827]">{nights}</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Total Estimated:</span> <strong className="text-[#111827]">₹{estimatedTotal.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Advance Paid:</span> <strong className="text-[#15803D]">₹{advancePayment.amount || 0}</strong>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Balance Due:</span> <strong className="text-[#DC2626]">₹{Math.max(0, estimatedTotal - (Number(advancePayment.amount) || 0)).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Guest Stay Agreement / House Rules Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 max-h-48 overflow-y-auto">
              <p className="font-bold text-[#172554] uppercase tracking-wider">
                {declaration?.title || 'Rivanta Hotel Stay Agreement & House Rules'}
              </p>
              <div className="whitespace-pre-line text-[#475569] leading-relaxed">
                {declaration?.content ||
                  '1. Standard check-in 2:00 PM, check-out 11:00 AM.\n2. Valid government ID required.\n3. Non-smoking property indoors.\n4. Quiet hours observed after 10:00 PM.\n5. Unsettled bills must be paid at checkout.'}
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="decAccept"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E]"
              />
              <label htmlFor="decAccept" className="text-xs font-semibold text-[#111827] cursor-pointer">
                I hereby declare that all information provided is accurate, and I agree to abide by Rivanta's house rules and terms of stay.
              </label>
            </div>

            {/* Digital Signature Canvas */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-2">
                Guest Digital Signature <span className="text-red-500">*</span>
              </label>
              <SignatureCanvas onSave={(dataUrl) => setSignatureUrl(dataUrl)} />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-[#F1F5F9] mt-8">
          {currentStep > 1 ? (
            <Button variant="outline" size="md" onClick={prevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <Button variant="primary" size="md" onClick={nextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue to Step {currentStep + 1}
            </Button>
          ) : (
            <Button
              variant="accent"
              size="lg"
              onClick={handleSubmitCheckIn}
              isLoading={loading}
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
            >
              Complete Check-in & Assign Room
            </Button>
          )}
        </div>
      </Card>
    </DashboardShell>
  );
}
