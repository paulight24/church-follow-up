import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';
import { downloadFullExport, getSubscription, requestTierChange } from '@/features/churches/api';

/**
 * Set VITE_SHOW_TIER_UPGRADE=true to surface the tier-upgrade request UI.
 * Tiers are free during launch but deliberately hidden until the AI tools
 * ship; the export section is always visible — the church's data is theirs
 * in every subscription state.
 */
const SHOW_TIER_UPGRADE = import.meta.env.VITE_SHOW_TIER_UPGRADE === 'true';

export function DataExportCard() {
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportDone, setExportDone] = useState(false);

  const canExport = hasPermission('church.export_data') || hasPermission('members.export');

  const subscriptionQuery = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: getSubscription,
    enabled: SHOW_TIER_UPGRADE,
  });

  const tierMutation = useMutation({
    mutationFn: () => requestTierChange('PREMIUM_AI'),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['billing'] }),
  });

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    setExportDone(false);
    try {
      await downloadFullExport();
      setExportDone(true);
    } catch {
      setExportError('The export could not be generated. Please try again or contact support.');
    } finally {
      setExporting(false);
    }
  };

  if (!canExport) return null;

  const lapsed = user?.activeChurch?.subscriptionStatus === 'LAPSED';
  const pendingTierRequest = subscriptionQuery.data?.pendingTierRequest;
  const onPremium = subscriptionQuery.data?.subscriptionTier === 'PREMIUM_AI';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          Your Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Export everything your church owns</p>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              One ZIP with every record — members, follow-ups, attendance, prayer requests and
              more — as spreadsheets (CSV) plus a complete JSON copy.
              {lapsed && (
                <span className="font-medium text-amber-700">
                  {' '}Available even now: your data is always yours.
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={() => void handleExport()}
            isLoading={exporting}
            leftIcon={<Download className="h-4 w-4" />}
            className="shrink-0"
          >
            {exporting ? 'Preparing…' : 'Download full export'}
          </Button>
        </div>

        {exportDone && (
          <Alert variant="success" className="mt-4" onDismiss={() => setExportDone(false)}>
            Export downloaded. Keep it somewhere safe.
          </Alert>
        )}
        {exportError && (
          <Alert variant="error" className="mt-4" onDismiss={() => setExportError(null)}>
            {exportError}
          </Alert>
        )}

        {SHOW_TIER_UPGRADE && subscriptionQuery.data && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Plan: {onPremium ? 'Premium + AI tools' : 'Standard'}
                </p>
                <p className="mt-1 max-w-xl text-sm text-slate-500">
                  {onPremium
                    ? 'Your church has access to the AI-assisted tools as they roll out.'
                    : 'The Premium tier adds upcoming AI-assisted tools and supports the platform infrastructure.'}
                </p>
              </div>
              {!onPremium && (
                pendingTierRequest ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                    <Clock className="h-3.5 w-3.5" />
                    Upgrade requested — awaiting review
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    isLoading={tierMutation.isPending}
                    onClick={() => tierMutation.mutate()}
                  >
                    Request Premium upgrade
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
