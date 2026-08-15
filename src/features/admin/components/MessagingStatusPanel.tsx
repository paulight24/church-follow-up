import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, MessageSquareText, Phone, CheckCircle2, AlertCircle, Send, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import api from '@/config/api';

/**
 * Live readiness of every outbound channel, with a real test send for SMS
 * and WhatsApp. This is the panel to watch while pasting credentials in:
 * it says whether a channel will actually deliver, and whose account it will
 * deliver through — the church's own or the platform's shared one.
 */
interface ChannelStatus {
  ready: boolean;
  source: 'church' | 'platform' | 'none';
  detail?: string;
  missing?: string;
}

interface MessagingStatus {
  email: ChannelStatus;
  sms: ChannelStatus;
  whatsapp: ChannelStatus & { qualityRating?: string; verificationStatus?: string };
  deliverySuppressed: boolean;
}

type TestChannel = 'sms' | 'whatsapp';

const SOURCE_LABEL: Record<ChannelStatus['source'], string> = {
  church: 'your account',
  platform: 'platform account',
  none: 'not configured',
};

export function MessagingStatusPanel() {
  const [testNumber, setTestNumber] = useState('');
  const [sending, setSending] = useState<TestChannel | null>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['messaging-status'],
    queryFn: () => api.get<MessagingStatus>('/settings/messaging/status').then((res) => res.data),
  });

  const sendTest = async (channel: TestChannel) => {
    setSending(channel);
    setResult(null);
    try {
      const res = await api.post(`/settings/${channel}/test`, { to: testNumber || undefined });
      const { provider, to, result: outcome } = res.data;
      setResult(
        outcome.status === 'SENT'
          ? {
              type: 'success',
              message:
                outcome.providerMessageId === 'suppressed-by-send-guard'
                  ? `Accepted, but delivery is suppressed on this server — nothing was actually sent to ${to}.`
                  : `Sent to ${to} via ${provider}. Check the handset.`,
            }
          : { type: 'error', message: `${provider} could not send it: ${outcome.failureReason}` }
      );
    } catch (err) {
      const apiError = err as { response?: { data?: { error?: { message?: string } } } };
      setResult({
        type: 'error',
        message: apiError.response?.data?.error?.message ?? 'Could not send the test. Check server logs.',
      });
    } finally {
      setSending(null);
      void refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="text-indigo-600" />
      </div>
    );
  }
  if (!data) return null;

  const rows: Array<{ key: string; label: string; icon: typeof Mail; status: ChannelStatus; test?: TestChannel }> = [
    { key: 'email', label: 'Email', icon: Mail, status: data.email },
    { key: 'sms', label: 'SMS', icon: Phone, status: data.sms, test: 'sms' },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquareText, status: data.whatsapp, test: 'whatsapp' },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">Delivery status</h3>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          disabled={isFetching}
        >
          {isFetching ? 'Checking…' : 'Re-check'}
        </button>
      </div>

      {data.deliverySuppressed && (
        <Alert variant="warning" className="mb-4">
          <span className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              This server is not delivering to real recipients — outbound messages are being suppressed
              and reported as sent. That is the safe default outside production.
            </span>
          </span>
        </Alert>
      )}

      <div className="space-y-2.5">
        {rows.map(({ key, label, icon: Icon, status, test }) => (
          <div
            key={key}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${status.ready ? 'text-indigo-500' : 'text-slate-300'}`} />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-900">
                  {label}
                  <Badge variant={status.ready ? 'success' : 'gray'} size="sm">
                    {status.ready ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Not set up
                      </span>
                    )}
                  </Badge>
                  {status.ready && (
                    <span className="text-xs font-normal text-slate-400">via {SOURCE_LABEL[status.source]}</span>
                  )}
                </p>
                <p className="mt-0.5 break-words text-xs text-slate-500">{status.detail || status.missing}</p>
              </div>
            </div>

            {test && status.ready && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Send className="h-3.5 w-3.5" />}
                onClick={() => void sendTest(test)}
                isLoading={sending === test}
                className="shrink-0"
              >
                Send test
              </Button>
            )}
          </div>
        ))}
      </div>

      {(data.sms.ready || data.whatsapp.ready) && (
        <div className="mt-4 max-w-xs">
          <Input
            label="Test number"
            placeholder="+1 951 224 4921"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
            helpText="Leave blank to use the number on your own account."
          />
        </div>
      )}

      {result && (
        <Alert variant={result.type === 'success' ? 'success' : 'error'} className="mt-4">
          {result.message}
        </Alert>
      )}
    </div>
  );
}
