'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { BedDouble, Plus, Sparkles, Wrench } from 'lucide-react';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add room modal
  const [modalOpen, setModalOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('1');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [rateOverride, setRateOverride] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, rtRes] = await Promise.all([
        apiRequest('/rooms'),
        apiRequest('/room-types'),
      ]);
      setRooms(rRes || []);
      setRoomTypes(rtRes || []);
      if (rtRes && rtRes.length > 0) {
        setRoomTypeId(rtRes[0].id);
      }
    } catch (err: any) {
      toast.error('Failed to load room inventory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRoom = async () => {
    if (!roomNumber || !roomTypeId) {
      toast.error('Room number and room category are required');
      return;
    }
    try {
      await apiRequest('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          roomNumber,
          floor: Number(floor),
          roomTypeId,
          rateOverride: rateOverride ? Number(rateOverride) : null,
          notes,
        }),
      });
      toast.success(`Room ${roomNumber} added to inventory`);
      setModalOpen(false);
      setRoomNumber('');
      setRateOverride('');
      setNotes('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create room');
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Room Inventory Management</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Configure hotel physical rooms, floor mapping, and rate overrides
          </p>
        </div>
        <Button size="sm" variant="accent" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Physical Room
        </Button>
      </div>

      <Card>
        <CardHeader title={`Physical Rooms (${rooms.length})`} subtitle="Configured room inventory across floors" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading rooms...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Room Number</th>
                  <th className="pb-3">Floor</th>
                  <th className="pb-3">Room Category</th>
                  <th className="pb-3">Base Price</th>
                  <th className="pb-3">Rate Override</th>
                  <th className="pb-3 text-center">Operational Status</th>
                  <th className="pb-3 text-center">Housekeeping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-extrabold text-sm text-[#172554]">Room {r.roomNumber}</td>
                    <td className="py-3 text-[#64748B]">Floor {r.floor}</td>
                    <td className="py-3 font-semibold text-[#111827]">{r.roomType?.name}</td>
                    <td className="py-3 font-mono">₹{Number(r.roomType?.basePrice).toLocaleString('en-IN')}/night</td>
                    <td className="py-3 font-mono text-[#0F766E]">
                      {r.rateOverride ? `₹${Number(r.rateOverride).toLocaleString('en-IN')}` : 'None (Base)'}
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant={r.status === 'AVAILABLE' ? 'success' : r.status === 'OCCUPIED' ? 'info' : 'warning'} size="sm">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant={r.housekeepingStatus === 'CLEAN' ? 'success' : 'warning'} size="sm">
                        {r.housekeepingStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Room Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Physical Room" subtitle="Register a new room into inventory" maxWidth="md">
        <div className="space-y-4">
          <Input
            label="Room Number"
            required
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g. 106 or 501"
          />

          <Input
            label="Floor Number"
            type="number"
            min="1"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          />

          <Select
            label="Room Category"
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(e.target.value)}
            options={roomTypes.map((rt) => ({
              label: `${rt.name} (Base ₹${Number(rt.basePrice).toLocaleString('en-IN')})`,
              value: rt.id,
            }))}
          />

          <Input
            label="Custom Rate Override (₹, optional)"
            type="number"
            value={rateOverride}
            onChange={(e) => setRateOverride(e.target.value)}
            placeholder="Leave empty to use category base rate"
          />

          <Input
            label="Internal Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Corner room with panoramic terrace"
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="accent" size="sm" onClick={handleCreateRoom}>Add Room</Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
