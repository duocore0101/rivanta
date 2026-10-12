'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { BedDouble, BarChart2, Download, Printer } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function OccupancyReportPage() {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/reports/occupancy');
        setReport(data);
      } catch (err: any) {
        toast.error('Failed to load occupancy report: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOccupancy();
  }, []);

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Occupancy Analytics</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Physical room utilization, room-nights sold, and floor-wise distribution
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button size="sm" variant="primary" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
            Print Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Occupancy by Room Type */}
        <Card>
          <CardHeader title="Occupancy by Room Category" subtitle="Deluxe Suite vs Executive King vs Superior Double" />
          <div className="space-y-4">
            {report?.byRoomType?.map((rt: any, index: number) => (
              <div key={rt.id || rt.name || rt.type || index} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-[#111827]">{rt.name || rt.type}</span>
                  <span className="font-mono text-[#0F766E] font-bold">
                    {rt.occupied} / {rt.total} rooms ({rt.occupancyRate ?? rt.rate ?? 0}%)
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0F766E] h-full rounded-full transition-all duration-500"
                    style={{ width: `${rt.occupancyRate ?? rt.rate ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Occupancy by Floor */}
        <Card>
          <CardHeader title="Occupancy by Floor Level" subtitle="Floor 1 to Floor 4 utilization" />
          <div className="space-y-4">
            {report?.byFloor?.map((fl: any, index: number) => (
              <div key={fl.floor || index} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-[#111827]">
                    {typeof fl.floor === 'number' ? `Floor ${fl.floor}` : fl.floor}
                  </span>
                  <span className="font-mono text-[#172554] font-bold">
                    {fl.occupied} / {fl.total} occupied ({fl.occupancyRate ?? 0}%)
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#172554] h-full rounded-full transition-all duration-500"
                    style={{ width: `${fl.occupancyRate ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 7-Day Trend Chart */}
      <Card>
        <CardHeader title="7-Day Historical Occupancy Rate (%)" subtitle="Consecutive daily utilization trend" />
        <div className="h-64 w-full">
          {report?.trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(v: any) => [`${v}%`, 'Occupancy Rate']}
                  contentStyle={{ backgroundColor: '#172554', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="rate" fill="#172554" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
              No occupancy trends available
            </div>
          )}
        </div>
      </Card>
    </DashboardShell>
  );
}
