'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import {
  TrendingUp,
  BedDouble,
  LogIn,
  LogOut,
  IndianRupee,
  Layers,
  ArrowUpRight,
  Sparkles,
  Calendar,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [occupancyData, setOccupancyData] = useState<any>(null);
  const [bookingSources, setBookingSources] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [kpiRes, revRes, occRes, bookRes, logsRes] = await Promise.all([
        apiRequest(`/reports/kpis?timeframe=${timeframe}`),
        apiRequest('/reports/revenue?days=14'),
        apiRequest('/reports/occupancy'),
        apiRequest('/reports/bookings'),
        apiRequest('/audit-logs?limit=5'),
      ]);

      setKpis(kpiRes?.kpis || kpiRes || null);
      setRevenueData(revRes || null);
      setOccupancyData(occRes || null);
      const sourcesList = Array.isArray(bookRes) ? bookRes : bookRes?.sources || [];
      setBookingSources(sourcesList);
      setRecentLogs(Array.isArray(logsRes) ? logsRes : logsRes?.logs || []);
    } catch (err: any) {
      toast.error('Failed to load executive analytics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const COLORS = ['#172554', '#0F766E', '#4F46E5', '#D97706', '#15803D', '#64748B'];

  return (
    <DashboardShell>
      {/* Top Header & Timeframe Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Executive Intelligence Dashboard</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time business performance, room occupancy, revenue recognized, and operations
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#CBD5E1] shadow-xs text-xs">
          {(['today', 'week', 'month', 'year'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all capitalize ${
                timeframe === tf
                  ? 'bg-[#172554] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              {tf === 'week' ? 'This Week' : tf === 'month' ? 'This Month' : tf === 'year' ? 'This Year' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* KPI 1: Total Revenue */}
        <Card hoverable className="p-5! border-blue-200" onClick={() => router.push('/admin/reports/revenue')}>
          <div className="flex items-center justify-between text-[#1D4ED8] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-lg bg-blue-50 text-[#172554]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#172554]">
            ₹{Number(kpis?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> Net Cash: ₹{Number(kpis?.netCashCollected || 0).toLocaleString('en-IN')}
            </span>
          </p>
        </Card>

        {/* KPI 2: Occupancy Rate */}
        <Card hoverable className="p-5! border-teal-200" onClick={() => router.push('/admin/reports/occupancy')}>
          <div className="flex items-center justify-between text-[#0F766E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Occupancy Rate</span>
            <div className="p-2 rounded-lg bg-teal-50 text-[#0F766E]">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#111827]">
            {kpis?.occupancyPercentage || 0}%
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            {kpis?.occupiedRooms || 0} occupied of {kpis?.totalRooms || 0} physical rooms
          </p>
        </Card>

        {/* KPI 3: Today's Arrivals */}
        <Card hoverable className="p-5! border-indigo-200" onClick={() => router.push('/front-desk/arrivals')}>
          <div className="flex items-center justify-between text-indigo-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Check-ins</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <LogIn className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#111827]">
            {kpis?.todayActualCheckIns || 0}
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            {kpis?.todayExpectedRemainingCheckIns || 0} expected arrivals remaining
          </p>
        </Card>

        {/* KPI 4: Today's Departures */}
        <Card hoverable className="p-5! border-amber-200" onClick={() => router.push('/front-desk/departures')}>
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Check-outs</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#111827]">
            {kpis?.todayCompletedCheckOuts || 0}
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            {kpis?.todayExpectedRemainingCheckOuts || 0} departures due today
          </p>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue Performance Trend (14 Days)"
            subtitle="Recognized tariff, dining, and service charges"
            action={
              <Link href="/admin/reports/revenue" className="text-xs text-[#0F766E] font-semibold hover:underline">
                View Breakdown →
              </Link>
            }
          />

          <div className="h-64 w-full">
            {revenueData?.dailyTrends?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.dailyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#172554" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#172554" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#172554', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#172554" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
                No revenue trends to display for this period
              </div>
            )}
          </div>
        </Card>

        {/* Revenue by Category Bar Chart */}
        <Card>
          <CardHeader
            title="Revenue by Category"
            subtitle="Room tariff vs dining vs services"
          />

          <div className="h-64 w-full">
            {revenueData?.categoryBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData.categoryBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(val) => `₹${val}`} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#172554', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="total" fill="#0F766E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
                No category charges recorded
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Booking Sources & Audit Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Sources Breakdown */}
        <Card>
          <CardHeader
            title="Booking Source Distribution"
            subtitle="Walk-ins vs MakeMyTrip vs Agoda vs Direct web bookings"
            action={
              <Link href="/admin/reports/bookings" className="text-xs text-[#0F766E] font-semibold hover:underline">
                View Commissions →
              </Link>
            }
          />

          <div className="space-y-3">
            {bookingSources.map((source, index) => (
              <div key={source.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-bold text-[#111827]">{source.name}</p>
                    <p className="text-[10px] text-[#64748B]">
                      {source.isDirect ? 'Direct (0% comm)' : `Partner (${source.commissionRate}% comm)`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#172554]">{source.totalBookings} stay(s)</p>
                  <p className="text-[10px] text-[#15803D] font-medium">₹{source.bookingValue.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Staff Activity & Audit Trail */}
        <Card>
          <CardHeader
            title="Recent Staff Activity & Audit Log"
            subtitle="Immutable audit trail of front desk operations"
            action={
              <Link href="/admin/audit-logs" className="text-xs text-[#0F766E] font-semibold hover:underline">
                Full Audit Trail →
              </Link>
            }
          />

          <div className="divide-y divide-[#F1F5F9]">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-[#111827] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    {log.action}
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    By {log.user?.firstName || 'System'} ({log.user?.role || 'SYSTEM'}) • {new Date(log.createdAt).toLocaleTimeString('en-IN')}
                  </p>
                </div>
                <Badge variant="neutral" size="sm">{log.entityType}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
