'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { FileSignature, Save, Shield } from 'lucide-react';

export default function GuestDeclarationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchDeclaration = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/hotel/settings');
        if (data?.activeDeclaration) {
          setVersion(data.activeDeclaration.versionNumber);
          setTitle(data.activeDeclaration.title);
          setContent(data.activeDeclaration.content);
        }
      } catch (err: any) {
        toast.error('Failed to load declaration: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDeclaration();
  }, []);

  const handlePublishNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      const created = await apiRequest('/hotel/declaration', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });
      setVersion(created.versionNumber);
      toast.success(`Published Declaration Version ${created.versionNumber}! Past signed copies remain immutably preserved.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish declaration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Guest Stay Agreement & Declaration Rules</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          House rules, legal liability waivers, and terms presented to guests during digital signature capture
        </p>
      </div>

      <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl mb-6 text-xs text-teal-950 flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Immutable Audit & Versioning Guarantee</p>
          <p className="text-teal-800 mt-0.5">
            Publishing new terms creates Version {version + 1}. Previously signed guest declarations remain permanently bound to their historical version number and digital signature artifact.
          </p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader
          title={`Active Declaration (Version ${version})`}
          subtitle="Displayed on front desk tablets during guest check-in"
        />

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">Loading declaration text...</div>
        ) : (
          <form onSubmit={handlePublishNewVersion} className="space-y-4">
            <Input
              label="Declaration Document Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rivanta Guest Stay Agreement & House Rules"
            />

            <div>
              <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
                Complete House Rules & Legal Content
              </label>
              <textarea
                rows={12}
                required
                className="w-full bg-white rounded-lg border border-[#CBD5E1] text-xs font-mono text-[#111827] p-3 leading-relaxed focus:ring-2 focus:ring-[#172554] focus:outline-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-[#F1F5F9] flex justify-end">
              <Button type="submit" variant="accent" isLoading={saving} leftIcon={<FileSignature className="w-4 h-4" />}>
                Publish as Version {version + 1}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </DashboardShell>
  );
}
