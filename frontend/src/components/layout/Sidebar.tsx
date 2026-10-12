'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  UserCheck,
  BedDouble,
  Users,
  CalendarCheck,
  LogIn,
  LogOut,
  Sparkles,
  Receipt,
  CreditCard,
  History,
  TrendingUp,
  BarChart3,
  Layers,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Hotel,
  UserCog,
  FileSignature,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  highlight?: boolean;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const pathname = usePathname();
  const { user, hasRole } = useAuth();

  const isFrontDesk = pathname.startsWith('/front-desk');
  const isAdmin = pathname.startsWith('/admin');

  const frontDeskNav: NavItem[] = [
    { label: 'Front Desk Home', href: '/front-desk', icon: LayoutDashboard },
    { label: 'Guest Check-in', href: '/front-desk/check-in', icon: UserCheck, highlight: true },
    { label: 'Room Grid', href: '/front-desk/rooms', icon: BedDouble },
    { label: 'Guest Directory', href: '/front-desk/guests', icon: Users },
    { label: 'Arrivals Today', href: '/front-desk/arrivals', icon: LogIn },
    { label: 'Departures Today', href: '/front-desk/departures', icon: LogOut },
    { label: 'Housekeeping', href: '/front-desk/housekeeping', icon: Sparkles },
    { label: 'Invoices', href: '/front-desk/invoices', icon: Receipt },
    { label: 'Payments', href: '/front-desk/payments', icon: CreditCard },
    { label: 'Guest History', href: '/front-desk/guest-history', icon: History },
  ];

  const adminNav: NavItem[] = [
    { label: 'Executive Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Revenue Analytics', href: '/admin/reports/revenue', icon: TrendingUp },
    { label: 'Occupancy Reports', href: '/admin/reports/occupancy', icon: BarChart3 },
    { label: 'Booking Sources', href: '/admin/reports/bookings', icon: Layers },
    { label: 'Finance & Payments', href: '/admin/reports/payments', icon: CreditCard },
    { label: 'Room Inventory', href: '/admin/rooms', icon: BedDouble },
    { label: 'Room Types & Rates', href: '/admin/room-types', icon: Hotel },
    { label: 'Staff Accounts', href: '/admin/staff', icon: UserCog },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'Hotel Profile', href: '/admin/settings/hotel', icon: Settings },
    { label: 'Billing & Taxes', href: '/admin/settings/billing', icon: Receipt },
    { label: 'Guest Declaration', href: '/admin/settings/declaration', icon: FileSignature },
  ];

  const currentNav = isAdmin ? adminNav : frontDeskNav;

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-[#172554] text-white transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-blue-900/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center shrink-0 shadow-md">
            <span className="font-serif font-black text-white text-xl tracking-wider">R</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-base tracking-wide text-white truncate">RIVANTA</span>
              <span className="text-[10px] uppercase tracking-widest text-[#93C5FD]">Hotel Operations</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/50 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Role Switcher if Admin */}
      {hasRole('ADMIN') && !collapsed && (
        <div className="px-3 pt-3">
          <div className="bg-blue-950/60 p-1 rounded-xl flex gap-1 border border-blue-800/40 text-xs">
            <Link
              href="/front-desk"
              className={`flex-1 py-1.5 text-center font-medium rounded-lg transition-all ${
                isFrontDesk ? 'bg-[#0F766E] text-white shadow-xs' : 'text-blue-200 hover:text-white'
              }`}
            >
              Front Desk
            </Link>
            <Link
              href="/admin"
              className={`flex-1 py-1.5 text-center font-medium rounded-lg transition-all ${
                isAdmin ? 'bg-[#0F766E] text-white shadow-xs' : 'text-blue-200 hover:text-white'
              }`}
            >
              Admin / Owner
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {currentNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600/30 text-white border-l-4 border-[#0F766E] pl-2 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              } ${item.highlight && !isActive ? 'bg-[#0F766E]/20 text-[#5EEAD4] border border-[#0F766E]/40' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#2DD4BF]' : 'text-slate-400'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Role Tag */}
      <div className="p-3 border-t border-blue-900/40 bg-blue-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-sm shrink-0 border border-slate-500">
            {user?.firstName?.[0] || 'U'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#93C5FD] truncate">{user?.role || 'Staff'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
