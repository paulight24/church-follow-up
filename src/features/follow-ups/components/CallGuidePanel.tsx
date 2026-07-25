import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import type { Outcome } from '@/types/followUp';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { callGuidesApi } from '@/features/call-guides/api/call-guides.api';
import { OUTCOME_OPTIONS } from '../lib/taskDisplay';

interface CallGuidePanelProps {
  callGuideId: string;
  memberName: string;
  workerName: string;
  onOutcomeSelect?: (outcome: Outcome) => void;
}

/** Renders `{{variable}}` placeholders in a published call-guide script. */
function renderScript(content: string, vars: Record<string, string>): string {
  return content.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key: string) => vars[key] ?? `{{${key}}}`);
}

export function CallGuidePanel({ callGuideId, memberName, workerName, onOutcomeSelect }: CallGuidePanelProps) {
  const { data: guide, isLoading } = useQuery({
    queryKey: ['call-guide', callGuideId],
    queryFn: () => callGuidesApi.getCallGuide(callGuideId).then((r) => r.data),
    enabled: !!callGuideId,
  });

  const vars = { memberName, workerName, 'member.firstName': memberName.split(' ')[0] ?? memberName };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Guide{guide ? `: ${guide.name}` : ''}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {!isLoading && !guide?.currentVersion && (
          <EmptyState
            icon={FileText}
            title="No published script"
            description="This call guide doesn't have a published version yet."
          />
        )}

        {!isLoading && guide?.currentVersion && (
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">
              {guide.currentVersion.title}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-indigo-900">
              {renderScript(guide.currentVersion.content, vars)}
            </p>
          </div>
        )}

        {!isLoading && guide?.questions && guide.questions.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Questions to Cover</p>
            <ul className="space-y-1.5">
              {guide.questions.map((q: { id: string; question: string; isRequired: boolean }) => (
                <li key={q.id} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', q.isRequired ? 'bg-rose-400' : 'bg-slate-300')} />
                  <span>{q.question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Outcome buttons */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Quick Outcome</p>
          <div className="flex flex-wrap gap-2">
            {OUTCOME_OPTIONS.map((outcome) => (
              <button
                key={outcome.value}
                type="button"
                onClick={() => onOutcomeSelect?.(outcome.value)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
              >
                {outcome.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
