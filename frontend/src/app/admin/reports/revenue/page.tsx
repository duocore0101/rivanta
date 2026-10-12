'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { Download, Printer, TrendingUp, IndianRupee, Layers } from 'lucide-react';

export default function RevenueReportPage() {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/reports/revenue?days=${days}`);
      setReport(data);
    } catch (err: any) {
      toast.error('Failed to load revenue report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [days]);

  // CSV Export
  const handleExportCsv = () => {
    if (!report?.categoryBreakdown?.length) {
      toast.error('No revenue data available to export');
      return;
    }
    const headers = 'Category,Item Count,Total Recognized Revenue (INR)\n';
    const rows = report.categoryBreakdown
      .map((c: any) => `"${c.name}",${c.count},${c.total.toFixed(2)}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rivanta_Revenue_Report_${days}Days.csv`;
    a.click();
    toast.success('Revenue report downloaded as CSV');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Revenue & Financial Breakdown</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Recognized tariff income, dining charges, service breakdowns, and taxes
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button size="sm" variant="outline" onClick={handleExportCsv} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export CSV
          </Button>
          <Button size="sm" variant="primary" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
            Print Report
          </Button>
        </div>
      </div>

      {/* Accounting Distinction Alert Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6 text-xs text-blue-900 leading-relaxed">
        <p className="font-bold text-sm mb-1 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#172554]" /> Accounting Principles & Revenue Recognition:
        </p>
        <p>
          <strong>Recognized Revenue:</strong> Reflects completed room nights and hotel services actually consumed.
          <br />
          <strong>Cash Collections:</strong> Reflects physical cash, UPI, or card receipts captured at the front desk. Advance deposits are recorded as liabilities until stay nights are realized.
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-6 no-print">
        {[7, 14, 30, 90, 365].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              days === d ? 'bg-[#172554] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
            }`}
          >
            {d === 7 ? 'Last 7 Days' : d === 14 ? 'Last 14 Days' : d === 30 ? 'Last 30 Days' : d === 90 ? 'Last Quarter' : 'Year to Date'}
          </button>
        ))}
      </div>

      {/* Breakdown Table */}
      <Card>
        <CardHeader title="Revenue by Department / Category" subtitle={`Aggregated over the last ${days} days`} />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Aggregating financial ledger...</div>
        ) : report?.categoryBreakdown?.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">No recognized revenue in this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase font-semibold">
                  <th className="pb-3">Revenue Category</th>
                  <th className="pb-3 text-center">Transactions Posted</th>
                  <th className="pb-3 text-right">Recognized Total (₹)</th>
                  <th className="pb-3 text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {report.categoryBreakdown.map((cat: any) => {
                  const grandTotal = report.categoryBreakdown.reduce((acc: number, c: any) => acc + c.total, 0);
                  const share = grandTotal > 0 ? ((cat.total / grandTotal) * 100).toFixed(1) : 0;

                  return (
                    <tr key={cat.name} className="hover:bg-slate-50/60">
                      <td className="py-3 font-semibold text-[#111827]">{cat.name}</td>
                      <td className="py-3 text-center font-mono">{cat.count}</td>
                      <td className="py-3 text-right font-mono font-bold text-[#172554]">
                        ₹{Number(cat.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-mono text-[#0F766E] font-bold">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
