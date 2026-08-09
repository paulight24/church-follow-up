import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, MessageCircle, RefreshCw, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { usePermission } from '@/hooks/usePermission';
import { whatsAppApi } from '../api/whatsapp.api';
import { useWhatsAppStatus, useWhatsAppTemplates } from '../hooks/useWhatsAppStatus';

const REQUIRED_ENV_VARS = [
  { name: 'WHATSAPP_PHONE_NUMBER_ID', note: 'The Cloud API phone number to send from.' },
  { name: 'WHATSAPP_ACCESS_TOKEN', note: 'Permanent access token for the Meta app - never shown in this UI once set.' },
  { name: 'WHATSAPP_BUSINESS_ACCOUNT_ID', note: 'The WhatsApp Business Account (WABA) that owns the templates.' },
];

const WEBHOOK_ENV_VARS = [
  { name: 'WHATSAPP_VERIFY_TOKEN', note: 'Shared secret Meta uses to verify the webhook URL.' },
  { name: 'WHATSAPP_APP_SECRET', note: "Verifies inbound webhook payloads are really from Meta - needed to track the 24-hour reply window." },
];

const qualityVariant: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
  GREEN: 'success',
  YELLOW: 'warning',
  RED: 'danger',
};

const templateStatusVariant: Record<string, 'success' | 'gray' | 'danger'> = {
  APPROVED: 'success',
  PENDING: 'gray',
  REJECTED: 'danger',
};

/**
 * Settings > Integration Settings > WhatsApp Business card. Replaces the old
 * static "Not yet implemented" copy with a real connection status panel
 * driven by GET /whatsapp/status, plus a template sync + listing driven by
 * GET/POST /whatsapp/templates(/sync). Gated on `system.settings` - the
 * route already enforces this, this is a defense-in-depth check on the
 * panel itself.
 */
export function WhatsAppSettingsPanel() {
  const canManage = usePermission('system.settings');
  const queryClient = useQueryClient();
  const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: status, isLoading, isError } = useWhatsAppStatus();
  const configured = status?.configured ?? false;
  const { data: templates, isLoading: templatesLoading } = useWhatsAppTemplates(configured);

  const syncMutation = useMutation({
    mutationFn: () => whatsAppApi.syncTemplates(),
    onSuccess: (res) => {
      setSyncResult({
        type: 'success',
        message: res.data.message ?? `Synced ${res.data.synced} template(s) from Meta.`,
      });
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'templates'] });
    },
    onError: () => {
      setSyncResult({ type: 'error', message: 'Could not sync templates from Meta. Check server logs.' });
    },
  });

  if (!canManage) return null;

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-medium text-slate-900">
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          WhatsApp Business
        </h4>
        {!isLoading && !isError && (
          <Badge variant={configured ? 'success' : 'gray'} dot size="sm">
            {configured ? 'Connected' : 'Not connected'}
          </Badge>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
          <Spinner size="sm" /> Checking connection...
        </div>
      )}

      {isError && <Alert variant="error">Could not check WhatsApp status. Please try again.</Alert>}

      {!isLoading && !isError && !configured && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            WhatsApp delivery is off until these are set as environment variables on the server (Hostinger) - there is
            no in-app credentials UI, and access tokens are never entered or displayed here.
          </p>
          <div className="space-y-1.5 rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Required to connect</p>
            {REQUIRED_ENV_VARS.map((v) => (
              <div key={v.name} className="flex items-start gap-2 text-xs">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                <span>
                  <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-slate-700">{v.name}</code>
                  <span className="text-slate-500"> - {v.note}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Required for the webhook (inbound messages, delivery status, the 24-hour reply window)
            </p>
            {WEBHOOK_ENV_VARS.map((v) => (
              <div key={v.name} className="flex items-start gap-2 text-xs">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                <span>
                  <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-slate-700">{v.name}</code>
                  <span className="text-slate-500"> - {v.note}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && configured && (
        <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Display name</dt>
              <dd className="mt-0.5 text-sm text-slate-700">{status?.verifiedName ?? '--'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Phone number</dt>
              <dd className="mt-0.5 text-sm text-slate-700">{status?.displayPhoneNumber ?? '--'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Quality rating</dt>
              <dd className="mt-0.5">
                {status?.qualityRating ? (
                  <Badge variant={qualityVariant[status.qualityRating] ?? 'gray'} size="sm">
                    {status.qualityRating}
                  </Badge>
                ) : (
                  <span className="text-sm text-slate-400">--</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Verification status</dt>
              <dd className="mt-0.5 text-sm text-slate-700">{status?.verificationStatus ?? '--'}</dd>
            </div>
          </dl>

          {status?.webhookConfigured === false && (
            <Alert variant="warning">
              Webhook credentials aren&apos;t set. Without them the app can&apos;t tell who messaged in the last 24
              hours, so free-form WhatsApp sends may be rejected by Meta more often than expected.
            </Alert>
          )}

          <div className="flex items-center gap-3 border-t border-slate-200 pt-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              isLoading={syncMutation.isPending}
              onClick={() => {
                setSyncResult(null);
                syncMutation.mutate();
              }}
            >
              Sync templates
            </Button>
            <span className="text-xs text-slate-500">Refetches approved/pending/rejected templates from Meta.</span>
          </div>
          {syncResult && <Alert variant={syncResult.type === 'success' ? 'success' : 'error'}>{syncResult.message}</Alert>}

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Templates</p>
            {templatesLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Spinner size="sm" /> Loading templates...
              </div>
            ) : (templates ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">
                No templates synced yet. Click <strong>Sync templates</strong> to fetch approved templates from Meta.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {templates!.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-400">
                        {t.language} - {t.category} - {t.parameterCount} parameter{t.parameterCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    <Badge variant={templateStatusVariant[t.status] ?? 'gray'} size="sm">
                      {t.status === 'APPROVED' && <CheckCircle2 className="h-3 w-3" />}
                      {t.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
