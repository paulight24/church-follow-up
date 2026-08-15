import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Cake,
  CheckCircle2,
  Gem,
  HeartHandshake,
  KeyRound,
  Mail,
  Megaphone,
  Monitor,
  Send,
  Smartphone,
  UserPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import api from '@/config/api';

/**
 * Shows every email the app sends, rendered with this church's own branding
 * and its saved greeting templates — the same HTML the provider receives,
 * so what an administrator sees here is what a member gets.
 */
interface EmailType {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const EMAIL_TYPES: EmailType[] = [
  { id: 'test', label: 'Delivery test', description: 'Confirms sending works', icon: CheckCircle2 },
  { id: 'birthday', label: 'Birthday', description: 'Your saved birthday template', icon: Cake },
  { id: 'anniversary', label: 'Anniversary', description: 'Your saved anniversary template', icon: Gem },
  { id: 'encouragement', label: 'Encouragement', description: 'Pastoral note to a member', icon: HeartHandshake },
  { id: 'campaign', label: 'Campaign', description: 'Bulk announcement to a segment', icon: Megaphone },
  { id: 'invite', label: 'Invitation', description: 'New user account setup', icon: UserPlus },
  { id: 'password-reset', label: 'Password reset', description: 'Security email', icon: KeyRound },
];

interface PreviewResponse {
  type: string;
  subject: string;
  html: string;
  text: string;
}

export function EmailPreviewCard() {
  const [selected, setSelected] = useState('test');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['email-preview', selected],
    queryFn: () => api.get<PreviewResponse>(`/settings/email/preview/${selected}`).then((res) => res.data),
  });

  const active = EMAIL_TYPES.find((t) => t.id === selected)!;

  const sendToMe = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await api.post('/settings/email/test', { type: selected });
      const { provider, to, result } = res.data;
      setSendResult(
        result.status === 'SENT'
          ? { type: 'success', message: `Sent to ${to} via ${provider}. Check your inbox.` }
          : { type: 'error', message: `${provider} could not send it: ${result.failureReason}` }
      );
    } catch {
      setSendResult({ type: 'error', message: 'Could not send the test email. Check server logs.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-500" />
            Email Design & Previews
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-5 text-sm text-slate-500">
          Every email carries your church's name, logo and contact details in the same design.
          Pick one to see exactly what a member receives — then send it to yourself to check it in a
          real inbox.
        </p>

        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          {/* Type picker */}
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {EMAIL_TYPES.map((type) => {
              const Icon = type.icon;
              const isActive = type.id === selected;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelected(type.id);
                    setSendResult(null);
                  }}
                  className={`flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition lg:w-full ${
                    isActive
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>
                    <span className="block text-sm font-medium leading-tight">{type.label}</span>
                    <span className="hidden text-xs text-slate-500 lg:block">{type.description}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Subject</p>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {data?.subject ?? (isLoading ? 'Loading…' : '—')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
                  <button
                    type="button"
                    aria-label="Desktop preview"
                    onClick={() => setDevice('desktop')}
                    className={`rounded-md p-1.5 ${device === 'desktop' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Mobile preview"
                    onClick={() => setDevice('mobile')}
                    className={`rounded-md p-1.5 ${device === 'mobile' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
                <Button size="sm" leftIcon={<Send className="h-4 w-4" />} onClick={sendToMe} isLoading={sending}>
                  Send to me
                </Button>
              </div>
            </div>

            <div className="flex justify-center p-4">
              {isLoading ? (
                <div className="flex h-[520px] items-center justify-center">
                  <Spinner size="lg" className="text-indigo-600" />
                </div>
              ) : isError ? (
                <Alert variant="error" className="w-full">
                  Could not render this preview.
                </Alert>
              ) : (
                <iframe
                  title={`${active.label} email preview`}
                  // Sandboxed with no permissions: the markup is already
                  // sanitised server-side, and this also stops a preview
                  // click from navigating away from Settings.
                  sandbox=""
                  srcDoc={data?.html ?? ''}
                  className={`h-[620px] rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${
                    device === 'mobile' ? 'w-[390px] max-w-full' : 'w-full'
                  }`}
                />
              )}
            </div>
          </div>
        </div>

        {sendResult && (
          <Alert variant={sendResult.type === 'success' ? 'success' : 'error'} className="mt-4">
            {sendResult.message}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
