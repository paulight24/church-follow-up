import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronRight,
  Download,
  FileWarning,
  QrCode,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { creativeApi, downloadPrintDocument, printApi } from '../api/creativePrint.api';
import { formatInches, PRINT_SIZE_LABELS, resolutionMessage } from '../lib/format';
import type { FlyerVersion, PrintDocument } from '@/types/creativePrint';

function errorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

/** The checklist a proof must clear before Approve enables. */
const CHECKLIST = [
  { key: 'names', label: 'Names are spelled correctly' },
  { key: 'dateTime', label: 'Date and time are right' },
  { key: 'address', label: 'The venue and address are right' },
  { key: 'photo', label: 'Any photo of a person is approved for use' },
] as const;

export function FlyerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const canGenerate = usePermission('creative.generate');
  const canApprove = usePermission('creative.approve');
  const canDownload = usePermission('print.download');

  const [instruction, setInstruction] = useState('');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [document, setDocument] = useState<PrintDocument | null>(null);

  const {
    data: flyer,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['flyer', id],
    queryFn: () => creativeApi.getFlyer(id!).then((res) => res.data),
    enabled: !!id,
    // While work is in flight the page polls, which is how a 202 endpoint
    // is meant to be consumed.
    refetchInterval: (query) => (query.state.data?.status === 'GENERATING' ? 2000 : false),
  });

  // Surface why a generation failed, rather than leaving the flyer to
  // silently fall back to DRAFT with no explanation.
  useQuery({
    queryKey: ['generation', generationId],
    queryFn: async () => {
      const generation = await creativeApi.getGeneration(generationId!).then((res) => res.data);
      if (generation.status === 'FAILED') {
        toast({
          title: 'Generation failed',
          description: generation.errorMessage ?? 'Please try again.',
          variant: 'error',
        });
        setGenerationId(null);
      } else if (generation.status === 'SUCCEEDED') {
        setGenerationId(null);
      }
      return generation;
    },
    enabled: !!generationId,
    refetchInterval: 2000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['flyer', id] });
    queryClient.invalidateQueries({ queryKey: ['flyers'] });
  };

  const generateMutation = useMutation({
    mutationFn: () => creativeApi.generate(id!, {}),
    onSuccess: (res) => {
      setGenerationId(res.data.id);
      invalidate();
    },
    onError: (err) =>
      toast({
        title: 'Could not start generating',
        description: errorMessage(err, 'Please try again.'),
        variant: 'error',
      }),
  });

  const reviseMutation = useMutation({
    mutationFn: () => creativeApi.revise(id!, { instruction }),
    onSuccess: (res) => {
      setGenerationId(res.data.id);
      setInstruction('');
      invalidate();
    },
    onError: (err) =>
      toast({
        title: 'Could not apply that change',
        description: errorMessage(err, 'Please try again.'),
        variant: 'error',
      }),
  });

  const selectMutation = useMutation({
    mutationFn: (versionId: string) => creativeApi.selectVersion(id!, versionId),
    onSuccess: invalidate,
  });

  const proofMutation = useMutation({
    mutationFn: (versionId: string) =>
      printApi.createDocument({ flyerVersionId: versionId, mode: 'OFFICE' }),
    onSuccess: (res) => setDocument(res.data),
    onError: (err) =>
      toast({
        title: 'Could not build the print file',
        description: errorMessage(err, 'Please try again.'),
        variant: 'error',
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (versionId: string) =>
      creativeApi.approve(id!, { flyerVersionId: versionId, checklist: checked }),
    onSuccess: () => {
      toast({ title: 'Flyer approved', description: 'You can now order prints.', variant: 'success' });
      invalidate();
    },
    onError: (err) =>
      toast({
        title: 'Could not approve',
        description: errorMessage(err, 'Please try again.'),
        variant: 'error',
      }),
  });

  // Arriving straight from the create form: start generating immediately.
  if (searchParams.get('generate') === '1' && flyer?.status === 'DRAFT' && !generateMutation.isPending) {
    setSearchParams({}, { replace: true });
    generateMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }
  if (isError || !flyer) return <Alert variant="error">Could not load this flyer.</Alert>;

  const current = flyer.versions.find((v) => v.id === flyer.currentVersionId) ?? flyer.versions.at(-1);
  const isGenerating = flyer.status === 'GENERATING';
  const isApproved = flyer.status === 'APPROVED';
  const allChecked = CHECKLIST.every((item) => checked[item.key]);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/creative" className="hover:text-indigo-600">
          Creative Studio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">{flyer.title}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{flyer.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {PRINT_SIZE_LABELS[flyer.printSize]}
            {flyer.event ? ` · ${flyer.event.name}` : ''}
          </p>
        </div>
        <StatusBadge status={flyer.status} type="flyer" />
      </div>

      {isGenerating ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <Spinner size="md" className="text-indigo-600" />
            <div>
              <p className="font-medium text-slate-900">Designing your flyer…</p>
              <p className="text-sm text-slate-500">
                This usually takes under a minute. You can leave this page — it keeps going.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {flyer.versions.length === 0 && !isGenerating ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Sparkles className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-slate-900">No designs yet</p>
              <p className="text-sm text-slate-500">
                Generate a few concepts and pick the one you like.
              </p>
            </div>
            {canGenerate ? (
              <Button
                leftIcon={<Sparkles className="h-4 w-4" />}
                isLoading={generateMutation.isPending}
                onClick={() => generateMutation.mutate()}
              >
                Generate concepts
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {flyer.versions.length > 0 ? (
        <Card>
          <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Designs
              <span className="ml-2 text-sm font-normal text-slate-500">
                {flyer.versions.length} {flyer.versions.length === 1 ? 'version' : 'versions'}
              </span>
            </h2>
          </div>
          <CardContent className="grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-3">
            {flyer.versions.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                isCurrent={version.id === flyer.currentVersionId}
                disabled={isApproved || selectMutation.isPending}
                onSelect={() => selectMutation.mutate(version.id)}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {current && !isApproved && canGenerate ? (
        <Card>
          <CardContent className="space-y-3 py-6">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Wand2 className="h-4 w-4 text-indigo-600" />
              Ask for a change
            </h2>
            <Textarea
              rows={3}
              maxLength={1000}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Make Pastor larger. Do not change his face."
              helpText="Plain English. Each change becomes a new version — nothing is overwritten."
            />
            <div className="flex justify-end">
              <Button
                isLoading={reviseMutation.isPending}
                disabled={instruction.trim().length < 3 || isGenerating}
                onClick={() => reviseMutation.mutate()}
              >
                Apply change
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {current && !isApproved ? (
        <Card>
          <CardContent className="space-y-4 py-6">
            <h2 className="font-semibold text-slate-900">Check the proof, then approve</h2>
            <p className="text-sm text-slate-500">
              Build the print-ready file and look at it properly. This is the file a printer would
              produce — not a preview of it.
            </p>

            <Button
              variant="outline"
              isLoading={proofMutation.isPending}
              onClick={() => proofMutation.mutate(current.id)}
            >
              Build print-ready proof
            </Button>

            {document ? <ProofSummary document={document} canDownload={canDownload} /> : null}

            {canApprove ? (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                {CHECKLIST.map((item) => (
                  <label key={item.key} className="flex items-start gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-indigo-600"
                      checked={!!checked[item.key]}
                      onChange={(e) =>
                        setChecked((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                    />
                    {item.label}
                  </label>
                ))}
                <Button
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  disabled={!allChecked}
                  isLoading={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(current.id)}
                >
                  Approve for print
                </Button>
                {!allChecked ? (
                  <p className="text-sm text-slate-500">
                    Tick every box once you have checked the proof.
                  </p>
                ) : null}
              </div>
            ) : (
              <Alert variant="info">
                Someone with approval rights needs to sign this off before it can be printed.
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : null}

      {isApproved ? (
        <Card>
          <CardContent className="space-y-3 py-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h2 className="font-semibold text-slate-900">Approved and ready to print</h2>
            </div>
            <p className="text-sm text-slate-500">
              Download the print-ready PDF and take it anywhere, or order copies through MemberCare.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                isLoading={proofMutation.isPending}
                onClick={() => current && proofMutation.mutate(current.id)}
              >
                Build print file
              </Button>
              {document && canDownload ? (
                <Button
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() => downloadPrintDocument(document.id, `${flyer.title}.pdf`)}
                >
                  Download PDF
                </Button>
              ) : null}
            </div>
            {document ? <ProofSummary document={document} canDownload={canDownload} /> : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function VersionCard({
  version,
  isCurrent,
  disabled,
  onSelect,
}: {
  version: FlyerVersion;
  isCurrent: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`rounded-lg border p-3 text-left transition-colors disabled:cursor-default ${
        isCurrent ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-slate-900">Version {version.versionNumber}</span>
        {isCurrent ? (
          <span className="text-xs font-medium text-indigo-700">Selected</span>
        ) : null}
      </div>
      {version.conceptLabel ? (
        <p className="mt-1 text-sm capitalize text-slate-500">
          {version.conceptLabel.toLowerCase()} concept
        </p>
      ) : null}
      {version.revisionInstruction ? (
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">“{version.revisionInstruction}”</p>
      ) : null}
      {version.brief?.headline ? (
        <p className="mt-2 truncate text-sm font-medium text-slate-700">
          {version.brief.headline}
        </p>
      ) : null}
    </button>
  );
}

/**
 * What the paper will actually be. Reports the real finished size, since
 * office mode scales the grid to fit a printable margin — showing the
 * nominal label when the paper says otherwise would be a lie.
 */
function ProofSummary({
  document,
  canDownload,
}: {
  document: PrintDocument;
  canDownload: boolean;
}) {
  const resolution = resolutionMessage(document.resolutionVerdict, document.effectiveDpi);

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <p className="text-slate-600">
          Finished size:{' '}
          <span className="font-medium text-slate-900">
            {formatInches(document.finishedInches.width)} ×{' '}
            {formatInches(document.finishedInches.height)}
          </span>
        </p>
        <p className="text-slate-600">
          Per sheet: <span className="font-medium text-slate-900">{document.perSheet}</span>
        </p>
      </div>

      <p className="flex items-center gap-1.5 text-sm">
        <QrCode className="h-4 w-4 text-slate-400" />
        {document.qrVerified ? (
          <span className="text-emerald-700">QR code verified — it scans to the right page.</span>
        ) : (
          <span className="text-slate-500">No QR code on this flyer.</span>
        )}
      </p>

      {resolution ? (
        <Alert variant={document.resolutionVerdict === 'BLOCK' ? 'error' : 'warning'}>
          {resolution}
        </Alert>
      ) : null}

      {document.warnings.map((warning) => (
        <p key={warning} className="flex items-start gap-1.5 text-sm text-amber-700">
          <FileWarning className="mt-0.5 h-4 w-4 shrink-0" />
          {warning}
        </p>
      ))}

      {canDownload ? (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={() => downloadPrintDocument(document.id, 'flyer-proof.pdf')}
        >
          Open the proof
        </Button>
      ) : null}
    </div>
  );
}
