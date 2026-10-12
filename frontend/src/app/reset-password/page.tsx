'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { Lock, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated successfully. Please sign in with your new password.');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1527] p-4 text-white">
      <Card className="max-w-md w-full bg-white text-[#111827] p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#172554]">Create New Password</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Enter a strong new password for your hotel account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" variant="primary" size="md" className="w-full">
            Update Password & Sign In
          </Button>

          <div className="text-center pt-2">
            <Link href="/login" className="text-xs text-[#64748B] hover:text-[#172554]">
              Cancel and return to login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
