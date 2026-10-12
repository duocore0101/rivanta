'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Search, Bell, Clock, User as UserIcon, LogOut, Plus, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/front-desk/guests?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white border-b border-[#E2E8F0] transition-all duration-300 flex items-center justify-between px-6 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest name, phone, room, stay #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#111827] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#172554] focus:border-transparent transition-all"
          />
        </form>
      </div>

      {/* Right Controls: Time, Quick Action, Notifications, User Profile */}
      <div className="flex items-center gap-4">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569]">
          <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
          <span className="font-medium">{currentDate}</span>
          <span className="text-[#94A3B8]">|</span>
          <span className="font-semibold text-[#172554]">{currentTime}</span>
        </div>

        {/* Quick Check-in Button */}
        <Button
          size="sm"
          variant="accent"
          onClick={() => router.push('/front-desk/check-in')}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="hidden sm:inline-flex"
        >
          New Check-in
        </Button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-[#64748B] hover:text-[#172554] hover:bg-[#F1F5F9] transition-colors relative"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#CBD5E1] p-3 text-xs z-50">
              <div className="font-bold text-[#111827] pb-2 border-b border-[#F1F5F9] flex justify-between items-center">
                <span>Operational Alerts</span>
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">Live</span>
              </div>
              <div className="space-y-2 mt-2">
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                  <p className="font-semibold">Room 103 Turnover Required</p>
                  <p className="text-[10px] text-amber-700">Guest departed; waiting for housekeeping inspection.</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-900">
                  <p className="font-semibold">Departure Today: Room 202</p>
                  <p className="text-[10px] text-blue-700">Sarah Jenkins checkout expected at 11:00 AM.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-[#111827] leading-tight">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-[#64748B]">{user?.role || 'Staff'}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#CBD5E1] py-1 text-xs z-50">
              <div className="px-4 py-2 border-b border-[#F1F5F9]">
                <p className="font-bold text-[#111827]">{user?.firstName} {user?.lastName}</p>
                <p className="text-[#64748B] truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[#DC2626] hover:bg-[#FEF2F2] font-semibold transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
