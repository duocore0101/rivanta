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
import {
  BedDouble,
  Sparkles,
  Wrench,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Filter,
  Plus,
} from 'lucide-react';

export default function RoomsManagementPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

  // Housekeeping update state
  const [housekeepingModalOpen, setHousekeepingModalOpen] = useState(false);
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [maintTitle, setMaintTitle] = useState('');
  const [maintDesc, setMaintDesc] = useState('');

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/rooms?status=${statusFilter}`);
      setRooms(data || []);
    } catch (err: any) {
      toast.error('Failed to load room inventory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [statusFilter]);

  const handleUpdateHousekeeping = async (newStatus: string) => {
    if (!selectedRoom) return;
    try {
      await apiRequest(`/rooms/${selectedRoom.id}/housekeeping`, {
        method: 'PATCH',
        body: JSON.stringify({ housekeepingStatus: newStatus }),
      });
      toast.success(`Room ${selectedRoom.roomNumber} updated to ${newStatus}`);
      setHousekeepingModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update housekeeping status');
    }
  };

  const handleReportMaintenance = async () => {
    if (!selectedRoom || !maintTitle) {
      toast.error('Please enter maintenance issue title');
      return;
    }
    try {
      await apiRequest('/maintenance/issues', {
        method: 'POST',
        body: JSON.stringify({
          roomId: selectedRoom.id,
          title: maintTitle,
          description: maintDesc || 'Reported from Front Desk room grid',
          priority: 'HIGH',
        }),
      });
      toast.success(`Maintenance issue logged for Room ${selectedRoom.roomNumber}`);
      setMaintModalOpen(false);
      setMaintTitle('');
      setMaintDesc('');
      fetchRooms();
    } catch (err: any) {
      toast.error(err.message || 'Failed to report issue');
    }
  };

  const getStatusBadge = (room: any) => {
    if (room.maintenanceStatus === 'UNDER_MAINTENANCE') {
      return <Badge variant="warning">Maintenance</Badge>;
    }
    if (room.status === 'OCCUPIED') {
      return <Badge variant="info">Occupied</Badge>;
    }
    if (room.status === 'OUT_OF_SERVICE') {
      return <Badge variant="error">Out of Service</Badge>;
    }
    if (room.housekeepingStatus === 'DIRTY' || room.housekeepingStatus === 'CLEANING_IN_PROGRESS') {
      return <Badge variant="warning">Turnover Required</Badge>;
    }
    return <Badge variant="success">Available</Badge>;
  };

  const filterTabs = [
    { label: 'All Rooms', value: 'ALL' },
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'Occupied', value: 'OCCUPIED' },
    { label: 'Out of Service', value: 'OUT_OF_SERVICE' },
  ];

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Room Inventory & Grid</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time status of all hotel rooms across floors with housekeeping and occupancy controls
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="accent"
            onClick={() => router.push('/front-desk/check-in')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Check-In Walk-In
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-[#E2E8F0] mb-6 shadow-xs">
        <div className="flex flex-wrap gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? 'bg-[#172554] text-white shadow-xs'
                  : 'text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-[#64748B] flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" /> Clean / Ready
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" /> Occupied
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Dirty / Housekeeping
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> Maintenance
          </span>
        </div>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-[#94A3B8]">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
          No rooms match the selected status filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rooms.map((room) => {
            const activeStay = room.stays?.[0];
            const isOccupied = room.status === 'OCCUPIED' && activeStay;

            return (
              <div
                key={room.id}
                className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#172554] hover:shadow-md transition-all p-4.5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-extrabold text-[#111827]">Room {room.roomNumber}</span>
                    {getStatusBadge(room)}
                  </div>

                  <p className="text-xs font-semibold text-[#0F766E]">{room.roomType?.name}</p>
                  <p className="text-[11px] text-[#64748B]">
                    Floor {room.floor} | Base ₹{Number(room.roomType?.basePrice || 0).toLocaleString('en-IN')}/night
                  </p>

                  {/* Occupant details if occupied */}
                  {isOccupied ? (
                    <div className="mt-3 p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs space-y-1">
                      <p className="font-bold text-[#172554] flex items-center gap-1 truncate">
                        <User className="w-3.5 h-3.5 text-blue-600 shrink-0" /> {activeStay.guest?.fullName || (activeStay.guest ? `${activeStay.guest.firstName || ''} ${activeStay.guest.lastName || ''}`.trim() : 'Guest')}
                      </p>
                      <p className="text-[10px] text-[#64748B] flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        Out: {new Date(activeStay.expectedCheckOutTime || activeStay.checkOutDate || Date.now()).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-[#64748B]">
                      <p className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        HK Status: <strong>{room.housekeepingStatus}</strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-[#F1F5F9] mt-4 flex items-center gap-2">
                  {isOccupied ? (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs"
                      onClick={() => router.push(`/front-desk/billing/${activeStay.id}`)}
                    >
                      Manage Folio
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="accent"
                      className="w-full text-xs"
                      disabled={room.status !== 'AVAILABLE' || room.housekeepingStatus !== 'CLEAN'}
                      onClick={() => router.push('/front-desk/check-in')}
                    >
                      Assign Stay
                    </Button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedRoom(room);
                      setHousekeepingModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9]"
                    title="Change Housekeeping Status"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRoom(room);
                      setMaintModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9]"
                    title="Report Maintenance Issue"
                  >
                    <Wrench className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Housekeeping Modal */}
      <Modal
        isOpen={housekeepingModalOpen}
        onClose={() => setHousekeepingModalOpen(false)}
        title={`Housekeeping Status: Room ${selectedRoom?.roomNumber}`}
        subtitle="Update cleaning readiness of this room"
        maxWidth="md"
      >
        <div className="space-y-3">
          <button
            onClick={() => handleUpdateHousekeeping('CLEAN')}
            className="w-full p-3 text-left rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-xs text-emerald-900">Mark as CLEAN & Ready</p>
              <p className="text-[10px] text-emerald-700">Room is inspected and ready for new guest arrival.</p>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </button>

          <button
            onClick={() => handleUpdateHousekeeping('DIRTY')}
            className="w-full p-3 text-left rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-xs text-amber-900">Mark as DIRTY / Turnover Needed</p>
              <p className="text-[10px] text-amber-700">Linen change and sanitization required before next stay.</p>
            </div>
            <Sparkles className="w-5 h-5 text-amber-600" />
          </button>

          <button
            onClick={() => handleUpdateHousekeeping('CLEANING_IN_PROGRESS')}
            className="w-full p-3 text-left rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-xs text-blue-900">Mark as Cleaning IN PROGRESS</p>
              <p className="text-[10px] text-blue-700">Housekeeping staff currently inside servicing room.</p>
            </div>
            <BedDouble className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      </Modal>

      {/* Maintenance Issue Modal */}
      <Modal
        isOpen={maintModalOpen}
        onClose={() => setMaintModalOpen(false)}
        title={`Report Maintenance: Room ${selectedRoom?.roomNumber}`}
        subtitle="Log HVAC, plumbing, or fixture issue"
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Issue Title"
            required
            value={maintTitle}
            onChange={(e) => setMaintTitle(e.target.value)}
            placeholder="e.g. AC cooling leak or Shower pressure low"
          />
          <div>
            <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              className="w-full bg-white rounded-lg border border-[#CBD5E1] text-sm text-[#111827] p-3 focus:ring-2 focus:ring-[#172554] focus:outline-none"
              rows={3}
              value={maintDesc}
              onChange={(e) => setMaintDesc(e.target.value)}
              placeholder="Provide context for engineering team..."
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setMaintModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleReportMaintenance}>
              Log Maintenance Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
