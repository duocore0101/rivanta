'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Hotel, Plus } from 'lucide-react';

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add room type modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [maxOccupancy, setMaxOccupancy] = useState('2');
  const [bedsCount, setBedsCount] = useState('1');
  const [sizeSqFt, setSizeSqFt] = useState('');

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/room-types');
      setRoomTypes(data || []);
    } catch (err: any) {
      toast.error('Failed to load room types: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const handleCreateRoomType = async () => {
    if (!name || !code || !basePrice) {
      toast.error('Name, Code, and Base Price are required');
      return;
    }
    try {
      await apiRequest('/room-types', {
        method: 'POST',
        body: JSON.stringify({
          name,
          code,
          description,
          basePrice: Number(basePrice),
          maxOccupancy: Number(maxOccupancy),
          bedsCount: Number(bedsCount),
          sizeSqFt: sizeSqFt ? Number(sizeSqFt) : null,
          amenities: ['Wi-Fi', 'Room Service', 'Air Conditioning'],
        }),
      });
      toast.success(`Room Category ${name} created`);
      setModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
      setBasePrice('');
      fetchRoomTypes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create room type');
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Room Categories & Base Tariffs</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage hotel room classes, standard nightly rates, capacities, and amenities
          </p>
        </div>
        <Button size="sm" variant="accent" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Create Room Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roomTypes.map((rt) => (
          <Card key={rt.id} hoverable>
            <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <span className="font-mono text-[10px] text-[#0F766E] uppercase font-bold tracking-wider">{rt.code}</span>
                <h3 className="text-lg font-bold text-[#111827]">{rt.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#64748B]">Nightly Tariff</span>
                <p className="text-xl font-black text-[#172554]">₹{Number(rt.basePrice).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <p className="text-xs text-[#64748B] mt-3">{rt.description || 'Spacious, well-appointed room tailored for business & leisure travelers.'}</p>

            <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-[#475569] bg-slate-50 p-2.5 rounded-lg">
              <div>
                <span className="text-[10px] text-[#94A3B8] block">Max Guests</span>
                <strong>{rt.maxOccupancy} Person(s)</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] block">Beds</span>
                <strong>{rt.bedsCount} Bed(s)</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#94A3B8] block">Physical Rooms</span>
                <strong className="text-[#0F766E]">{rt._count?.rooms || 0} active</strong>
              </div>
            </div>

            {rt.amenities?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {rt.amenities.map((a: string, i: number) => (
                  <Badge key={i} variant="neutral" size="sm">{a}</Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Room Type Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Room Category" subtitle="Define a new tier of guest suites" maxWidth="md">
        <div className="space-y-4">
          <Input
            label="Category Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Royal Club Room"
          />

          <Input
            label="Code (Short identifier)"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. RYL_CLB"
          />

          <Input
            label="Base Nightly Tariff (₹)"
            type="number"
            required
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            placeholder="e.g. 5200"
          />

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Max Occupancy"
              type="number"
              value={maxOccupancy}
              onChange={(e) => setMaxOccupancy(e.target.value)}
            />
            <Input
              label="Beds Count"
              type="number"
              value={bedsCount}
              onChange={(e) => setBedsCount(e.target.value)}
            />
            <Input
              label="Size (Sq Ft)"
              type="number"
              value={sizeSqFt}
              onChange={(e) => setSizeSqFt(e.target.value)}
              placeholder="e.g. 420"
            />
          </div>

          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short marketing and features description"
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="accent" size="sm" onClick={handleCreateRoomType}>Save Category</Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
