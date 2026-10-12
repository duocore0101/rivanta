'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck } from 'lucide-react';

export default function RolesMatrixPage() {
  const roles = [
    {
      name: 'Hotel Admin / Owner',
      code: 'ADMIN',
      description: 'Unrestricted master access to all operations, staff, financial ledgers, and hotel settings.',
      permissions: [
        'Full hotel settings & legal profile control',
        'Staff account creation, role assignment & deactivation',
        'Complete executive revenue & occupancy reporting',
        'Authorize discounts, refunds & charge voids',
        'Room inventory & base tariff configuration',
        'Publish immutable guest declaration versions',
      ],
    },
    {
      name: 'Receptionist / Front Desk',
      code: 'RECEPTIONIST',
      description: 'Day-to-day front desk operations, registration, room assignments, and folios.',
      permissions: [
        '5-step guest registration & digital signature capture',
        'Room assignment & availability lookup',
        'Post room night tariffs, dining & laundry charges',
        'Record advance, partial & final payments',
        'Extend stays and process guest checkout',
        'Generate and download PDF tax invoices',
      ],
    },
    {
      name: 'Housekeeping Staff',
      code: 'HOUSEKEEPING',
      description: 'Room cleanliness, turnover tracking, linen change, and maintenance reporting.',
      permissions: [
        'View pending turnover cleaning tasks',
        'Update cleaning progress (IN_PROGRESS / COMPLETED)',
        'Toggle room status to Clean & Ready',
        'Report HVAC, plumbing & electrical maintenance tickets',
      ],
    },
    {
      name: 'Accountant / Finance Staff',
      code: 'ACCOUNTANT',
      description: 'Financial reporting, reconciliation, and payment audits.',
      permissions: [
        'Access categorized revenue and tax reports',
        'Review payment methods and gateway reconciliation',
        'Audit guest folios and tax invoice archive',
        'Review refund requests and audit trail',
      ],
    },
  ];

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Role-Based Access Control (RBAC)</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Permission matrix enforced server-side through NestJS JWT & RolesGuards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((r) => (
          <Card key={r.code} hoverable>
            <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <span className="font-mono text-[10px] text-[#0F766E] uppercase font-bold tracking-wider">{r.code}</span>
                <h3 className="text-base font-bold text-[#111827]">{r.name}</h3>
              </div>
              <Badge variant="accent">Enforced</Badge>
            </div>

            <p className="text-xs text-[#64748B] mt-2.5">{r.description}</p>

            <div className="mt-4 pt-3 border-t border-[#F8FAFC]">
              <p className="text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-2">
                Authorized Operations:
              </p>
              <ul className="space-y-1.5 text-xs text-[#475569]">
                {r.permissions.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
