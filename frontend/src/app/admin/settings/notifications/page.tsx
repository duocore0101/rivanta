'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Mail, MessageSquare, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function NotificationsSettingsPage() {
  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">External Communications & Notifications</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Provider adapters, secret credentials verification, and invoice delivery configurations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email SMTP Provider */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#111827]">Email SMTP Delivery</h3>
                <p className="text-[10px] text-[#64748B]">Automated PDF invoice emails</p>
              </div>
            </div>
            <Badge variant="warning">Setup Required</Badge>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <p className="text-[#475569]">
              To enable outbound automated invoice emails, configure the following environment secrets on the NestJS backend:
            </p>

            <div className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-lg space-y-1">
              <p>SMTP_HOST=smtp.sendgrid.net</p>
              <p>SMTP_PORT=587</p>
              <p>SMTP_USER=apikey</p>
              <p>SMTP_PASSWORD=SG.••••••••••••</p>
              <p>SMTP_FROM=invoices@rivanta.com</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
              <p className="font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Safe Fallback Active
              </p>
              <p className="mt-0.5">
                While SMTP credentials remain unconfigured, share requests record an unconfigured notice instead of generating false success alerts.
              </p>
            </div>
          </div>
        </Card>

        {/* WhatsApp Business Provider */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#111827]">WhatsApp Business API</h3>
                <p className="text-[10px] text-[#64748B]">Instant mobile invoice links</p>
              </div>
            </div>
            <Badge variant="warning">Setup Required</Badge>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <p className="text-[#475569]">
              To enable instant WhatsApp delivery to Indian and international guest phone numbers, configure Twilio or Meta WhatsApp Cloud secrets:
            </p>

            <div className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-lg space-y-1">
              <p>TWILIO_WHATSAPP_SID=AC••••••••••••</p>
              <p>TWILIO_AUTH_TOKEN=••••••••••••••••</p>
              <p>TWILIO_WHATSAPP_NUMBER=+14155238886</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
              <p className="font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Safe Fallback Active
              </p>
              <p className="mt-0.5">
                Staff clicking "Share via WhatsApp" will be informed with a setup prompt until API tokens are supplied.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
