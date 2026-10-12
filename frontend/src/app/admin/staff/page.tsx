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
import { UserCog, Plus, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add staff modal
  const [modalOpen, setModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('RECEPTIONIST');
  const [password, setPassword] = useState('Password@123');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/staff');
      setStaff(data || []);
    } catch (err: any) {
      toast.error('Failed to load staff accounts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async () => {
    if (!firstName || !lastName || !email) {
      toast.error('First name, last name, and email are required');
      return;
    }
    try {
      await apiRequest('/staff', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          role,
          password,
        }),
      });
      toast.success(`Staff account created for ${firstName} ${lastName}`);
      setModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create staff account');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiRequest(`/staff/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      toast.success('Staff status updated');
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Staff & Role Administration</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage hotel staff accounts, authorization tiers, and active status
          </p>
        </div>
        <Button size="sm" variant="accent" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Staff Account
        </Button>
      </div>

      <Card>
        <CardHeader title={`Hotel Staff (${staff.length})`} subtitle="Authorized terminal users" />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading staff...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Assigned Role</th>
                  <th className="pb-3">Last Login</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {staff.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 font-bold text-[#111827]">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-3.5 text-[#475569]">{u.email}</td>
                    <td className="py-3.5 text-[#64748B]">{u.phone || 'N/A'}</td>
                    <td className="py-3.5">
                      <Badge
                        variant={
                          u.role === 'ADMIN'
                            ? 'accent'
                            : u.role === 'RECEPTIONIST'
                            ? 'info'
                            : u.role === 'ACCOUNTANT'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-[#64748B]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN') : 'Never'}
                    </td>
                    <td className="py-3.5 text-center">
                      <Badge variant={u.isActive ? 'success' : 'error'} size="sm">
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-right">
                      <Button
                        size="sm"
                        variant={u.isActive ? 'danger' : 'outline'}
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Staff Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Staff Account" subtitle="Grant operational terminal access" maxWidth="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Ramesh"
            />
            <Input
              label="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Patel"
            />
          </div>

          <Input
            label="Work Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rpatel@rivanta.com"
          />

          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98200 00000"
          />

          <Select
            label="Role Tier"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { label: 'Receptionist / Front Desk', value: 'RECEPTIONIST' },
              { label: 'Hotel Admin / Owner', value: 'ADMIN' },
              { label: 'Housekeeping Staff', value: 'HOUSEKEEPING' },
              { label: 'Accountant / Finance', value: 'ACCOUNTANT' },
            ]}
          />

          <Input
            label="Initial Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="accent" size="sm" onClick={handleCreateStaff}>Create Account</Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
