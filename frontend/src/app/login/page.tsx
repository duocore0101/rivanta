'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { ShieldCheck, Lock, Mail, Hotel, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@rivanta.com');
  const [password, setPassword] = useState('Password@123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Authentication successful! Welcome to Rivanta.');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0D1527] text-white">
      {/* Left Hospitality Hero Showcase */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 bg-gradient-to-br from-[#172554] via-[#0f172a] to-[#0A101D] border-b md:border-b-0 md:border-r border-blue-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F766E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center font-serif font-black text-white text-2xl shadow-xl shadow-teal-900/30">
              R
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wide">RIVANTA</h1>
              <p className="text-xs uppercase tracking-widest text-[#93C5FD]">Luxury Hotel & Suites</p>
            </div>
          </div>
        </div>

        <div className="z-10 my-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F766E]/20 text-[#2DD4BF] text-xs font-semibold mb-4 border border-[#0F766E]/40">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Hospitality SaaS Platform
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold leading-tight text-white mb-4">
            Unified Front Desk, Guest Folios & Executive Intelligence.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Digitize the complete guest lifecycle from multi-step registration and digital signatures to room turnover, folio charges, and real-time revenue analytics.
          </p>
        </div>

        <div className="z-10 text-xs text-slate-400 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
            <span>Role-Based Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Hotel className="w-4 h-4 text-[#2DD4BF]" />
            <span>PostgreSQL Persistence</span>
          </div>
        </div>
      </div>

      {/* Right Login Card */}
      <div className="w-full md:w-[480px] p-8 md:p-14 flex flex-col justify-center bg-white text-[#111827]">
        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#172554]">Staff Sign In</h2>
            <p className="text-xs text-[#64748B] mt-1">Access the hotel management terminal with authorized credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. receptionist@rivanta.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-semibold shadow-md"
                isLoading={isSubmitting}
              >
                Sign In to Terminal
              </Button>
            </div>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2.5">
              1-Click Demo Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('admin@rivanta.com')}
                className="p-2 text-left rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#172554] hover:bg-blue-50 transition-all text-xs"
              >
                <p className="font-bold text-[#172554]">Hotel Admin</p>
                <p className="text-[10px] text-[#64748B]">admin@rivanta.com</p>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('receptionist@rivanta.com')}
                className="p-2 text-left rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#0F766E] hover:bg-teal-50 transition-all text-xs"
              >
                <p className="font-bold text-[#0F766E]">Receptionist</p>
                <p className="text-[10px] text-[#64748B]">receptionist@rivanta.com</p>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('housekeeping@rivanta.com')}
                className="p-2 text-left rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] hover:border-slate-500 hover:bg-slate-50 transition-all text-xs"
              >
                <p className="font-bold text-[#334155]">Housekeeping</p>
                <p className="text-[10px] text-[#64748B]">housekeeping@rivanta.com</p>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('accountant@rivanta.com')}
                className="p-2 text-left rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] hover:border-indigo-500 hover:bg-indigo-50 transition-all text-xs"
              >
                <p className="font-bold text-indigo-900">Accountant</p>
                <p className="text-[10px] text-[#64748B]">accountant@rivanta.com</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
