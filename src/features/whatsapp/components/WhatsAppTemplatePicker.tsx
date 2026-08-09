import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, FileWarning, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { usePermission } from '@/hooks/usePermission';
import { useWhatsAppTemplates } from '../hooks/useWhatsAppStatus';
import { fillWhatsAppTemplate } from '../utils';
import type { WhatsAppTemplate } from '@/types/whatsapp';

const statusBadge: Record<string, { variant: 'success' | 'gray' | 'danger'; label: string }> = {
  APPROVED: { variant: 'success', label: 'Approved' },
  PENDING: { variant: 'gray', label: 'Pending review' },
  REJECTED: { variant: 'danger', label: 'Rejected' },
};

const statusExplanation: Record<string, string> = {
  PENDING: "Meta hasn't approved this template yet - it can't be used until it is.",
  REJECTED: 'Meta rejected this template. Edit and resubmit it in Meta Business Manager, then sync again.',
};

interface WhatsAppTemplatePickerProps {
  templateId: string | null;
  onTemplateChange: (templateId: string | null) => void;
  params: string[];
  onParamsChange: (params: string[]) => void;
}

/**
 * Lets the pastor pick an approved Meta message template and fill its
 * placeholders, with a live preview of the resulting message. Rendered by
 * PastorQuickSend/EditEncouragementModal once WHATSAPP is selected as a
 * *delivered* channel (WhatsApp configured, not the share-only affordance).
 */
export function WhatsAppTemplatePicker({ templateId, onTemplateChange, params, onParamsChange }: WhatsAppTemplatePickerProps) {
  const canManageSettings = usePermission('system.settings');
  const { data: templates, isLoading, isError } = useWhatsAppTemplates();

  const selected = (templates ?? []).find((t) => t.id === templateId) ?? null;

  function handleSelect(template: WhatsAppTemplate) {
    if (template.status !== 'APPROVED') return;
    onTemplateChange(template.id);
    onParamsChange(Array.from({ length: template.parameterCount }, (_, i) => params[i] ?? ''));
  }

  function handleParamChange(index: number, value: string) {
    const next = [...params];
    next[index] = value;
    onParamsChange(next);
  }

  return (
    <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
      <Alert variant="info">
        WhatsApp only lets you send a free-form message to someone who has messaged your church&apos;s WhatsApp number in
        the last 24 hours. Everyone else can only be reached with a pre-approved template - pick one below so those
        recipients aren&apos;t silently skipped. Members inside the 24-hour window will still get your free-form
        message above; the template is the fallback for everyone else.
      </Alert>

      {isLoading && (
        <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
          <Spinner size="sm" /> Loading templates...
        </div>
      )}

      {isError && (
        <Alert variant="error">Could not load WhatsApp templates. Please try again.</Alert>
      )}

      {!isLoading && !isError && (templates ?? []).length === 0 && (
        <EmptyState
          icon={FileWarning}
          title="No WhatsApp templates yet"
          description={
            canManageSettings
              ? 'Sync approved templates from Meta before sending. Go to Settings > WhatsApp Business and click "Sync templates".'
              : 'No templates have been synced from Meta yet. Ask an admin to sync templates from Settings > WhatsApp Business.'
          }
          action={
            canManageSettings ? (
              <Link
                to="/admin/settings"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                <RefreshCw className="h-4 w-4" />
                Go to Settings
              </Link>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && (templates ?? []).length > 0 && (
        <div className="space-y-2">
          {templates!.map((template) => {
            const isApproved = template.status === 'APPROVED';
            const isSelected = template.id === templateId;
            const badge = statusBadge[template.status] ?? { variant: 'gray' as const, label: template.status };

            return (
              <label
                key={template.id}
                className={cn(
                  'flex items-start gap-3 rounded-lg border-2 bg-white p-3 transition-all',
                  isApproved ? 'cursor-pointer' : 'cursor-not-allowed opacity-70',
                  isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300',
                )}
              >
                <input
                  type="radio"
                  name="whatsapp-template"
                  className="mt-1 h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed"
                  checked={isSelected}
                  disabled={!isApproved}
                  onChange={() => handleSelect(template)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{template.name}</span>
                    <Badge variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {template.language} - {template.category}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-slate-500">{template.body}</p>
                  {!isApproved && statusExplanation[template.status] && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600">
                      {template.status === 'PENDING' ? (
                        <Clock className="h-3.5 w-3.5" />
                      ) : (
                        <FileWarning className="h-3.5 w-3.5" />
                      )}
                      {statusExplanation[template.status]}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="space-y-3 border-t border-emerald-200 pt-3">
          {selected.parameterCount > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: selected.parameterCount }, (_, i) => (
                <Input
                  key={i}
                  label={`Parameter {{${i + 1}}}`}
                  value={params[i] ?? ''}
                  onChange={(e) => handleParamChange(i, e.target.value)}
                  placeholder={`Value for {{${i + 1}}}`}
                />
              ))}
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              This template has no fill-in parameters.
            </p>
          )}

          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Preview</p>
            <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
              {fillWhatsAppTemplate(selected.body, params)}
            </div>
            {selected.parameterCount > 0 && params.slice(0, selected.parameterCount).some((p) => !p?.trim()) && (
              <p className="mt-1 text-xs text-amber-600">
                Fill in every parameter above - Meta rejects the send if any are left blank.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
