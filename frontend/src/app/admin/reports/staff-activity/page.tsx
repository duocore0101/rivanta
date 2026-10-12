'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';

export default function StaffActivityReportPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/audit-logs?limit=100');
        setLogs(data || []);
      } catch (err: any) {
        toast.error('Failed to load activity logs: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Staff Operational Activity Reports</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Detailed log of staff logins, room status toggles, folio charges, and checkout events
        </p>
      </div>

      <Card>
        <CardHeader title={`Activity Log Entries (${logs.length})`} subtitle="Audited events by user identity" />
        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading activity records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Staff Member</th>
                  <th className="pb-3">Action Performed</th>
                  <th className="pb-3">Target Entity</th>
                  <th className="pb-3">Details / Audit Meta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 text-[#64748B] font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 font-semibold text-[#111827]">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'} ({log.user?.role || 'SYSTEM'})
                    </td>
                    <td className="py-3 font-mono font-bold text-[#172554]">{log.action}</td>
                    <td className="py-3">
                      <Badge variant="neutral" size="sm">{log.entityType}</Badge>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-[#475569] max-w-sm truncate">
                      {log.details ? JSON.stringify(log.details) : 'N/A'}
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
