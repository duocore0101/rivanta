'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { ShieldAlert, User, Clock, Terminal } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/audit-logs?limit=50');
        setLogs(data || []);
      } catch (err: any) {
        toast.error('Failed to load audit logs: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Security & Compliance Audit Trail</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Append-only, immutable logs tracking all sensitive front desk operations and configuration edits
        </p>
      </div>

      <Card>
        <CardHeader
          title={`Audit Records (${logs.length})`}
          subtitle="Chronological transaction and operational audit events"
        />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">No audit events logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Actor / Staff</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Target Entity</th>
                  <th className="pb-3">Parameters / Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 text-[#64748B] font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-[#111827]">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                      </p>
                      <p className="text-[10px] text-[#64748B]">{log.user?.role || 'SYSTEM'}</p>
                    </td>
                    <td className="py-3">
                      <span className="font-mono font-bold text-[#172554]">{log.action}</span>
                    </td>
                    <td className="py-3">
                      <Badge variant="neutral" size="sm">{log.entityType}</Badge>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-[#475569] max-w-xs truncate">
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
