'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your work email');
      return;
    }
    setSubmitted(true);
    toast.success('Password reset instructions sent if account exists');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1527] p-4 text-white">
      <Card className="max-w-md w-full bg-white text-[#111827] p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center font-serif font-black text-white text-2xl mb-3 shadow-md">
            R
          </div>
          <h2 className="text-xl font-bold text-[#172554]">Reset Terminal Password</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Enter your authorized hotel email address to receive password recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-900 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-sm">Recovery Link Dispatched</p>
            <p className="text-emerald-700">Check your inbox at <strong>{email}</strong> for instructions.</p>
            <div className="pt-2">
              <Link href="/login" className="text-xs font-semibold text-[#172554] hover:underline">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Staff Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. receptionist@rivanta.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Button type="submit" variant="primary" size="md" className="w-full">
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-[#64748B] hover:text-[#172554] flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
