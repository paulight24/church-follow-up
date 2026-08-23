import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Upload,
  ChevronRight,
  Download,
  FileWarning,
  Layers,
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
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    // Client-side guards reject with a plain Error and never reach the API;
    // without this they would surface as the generic fallback.
    (err instanceof Error ? err.message : undefined) ??
    fallback
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
  // '' = single-sided; otherwise the id of the APPROVED flyer whose approved
  // version becomes the back of a two-sided print file.
  const [backFlyerId, setBackFlyerId] = useState('');
  const [generationId, setGenerationId] = useState<string | null>(null);
  // Read inside the refetchInterval callback, which closes over the value
  // at query-creation time and would otherwise never see an update.
  const generationIdRef = useRef<string | null>(null);
  generationIdRef.current = generationId;
  const [document, setDocument] = useState<PrintDocument | null>(null);

  const {
    data: flyer,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['flyer', id],
    queryFn: () => creativeApi.getFlyer(id!).then((res) => res.data),
    enabled: !!id,
    // Poll while EITHER the server says it is generating or we are tracking
    // a generation we started. Keying off the flyer's own status alone was
    // a bug: the first fetch could land before the generate call, leaving
    // the query permanently idle while the work completed server-side.
    refetchInterval: (query) =>
      query.state.data?.status === 'GENERATING' || generationIdRef.current ? 2000 : false,
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
        invalidate();
      } else if (generation.status === 'SUCCEEDED') {
        setGenerationId(null);
        // Without this the page keeps showing "Designing your flyer…" over
        // artwork that already exists.
        invalidate();
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

  // Approved flyers make eligible back sides for a double-sided print —
  // typically a translation of this one (e.g. Spanish on the back).
  const { data: approvedFlyers } = useQuery({
    queryKey: ['flyers', 'approved-backs'],
    queryFn: () =>
      creativeApi.getFlyers({ status: 'APPROVED', pageSize: 100 }).then((res) => res.data.data),
  });
  const backOptions = (approvedFlyers ?? []).filter(
    (candidate) => candidate.id !== id && candidate.currentVersionId
  );
  const selectedBack = backOptions.find((candidate) => candidate.id === backFlyerId);

  const proofMutation = useMutation({
    mutationFn: (versionId: string) => {
      // A chosen back can vanish from the list — the approved-flyers query
      // shares the ['flyers'] prefix that every invalidate() touches, so an
      // unapprove elsewhere drops it. Refusing here is the point: building
      // single-sided under a button that says "two-sided" would be silent.
      if (backFlyerId && !selectedBack?.currentVersionId) {
        return Promise.reject(
          new Error(
            'That back design is no longer approved. Pick another, or build the front on its own.'
          )
        );
      }
      return printApi.createDocument({
        flyerVersionId: versionId,
        backFlyerVersionId: selectedBack?.currentVersionId ?? undefined,
        mode: 'OFFICE',
      });
    },
    onSuccess: (res) => setDocument(res.data),
    onError: (err) =>
      toast({
        title: 'Could not build the print file',
        description: errorMessage(err, 'Please try again.'),
        variant: 'error',
      }),
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadMutation = useMutation({
    mutationFn: (file: File) => creativeApi.uploadDesign(id!, file),
    onSuccess: () => {
      toast({
        title: 'Design uploaded',
        description: 'Build the proof to check it, then approve.',
        variant: 'success',
      });
      invalidate();
    },
    onError: (err) =>
      toast({
        title: 'Could not upload the design',
        description: errorMessage(err, 'Use a PNG or JPEG under 30MB.'),
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
  // In an effect, not during render — and guarded, because StrictMode runs
  // effects twice and a double-fire here would spend twice.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current) return;
    if (searchParams.get('generate') !== '1') return;
    if (flyer?.status !== 'DRAFT') return;
    autoStarted.current = true;
    setSearchParams({}, { replace: true });
    generateMutation.mutate();
  }, [flyer?.status, searchParams, setSearchParams, generateMutation]);

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
      {/* One hidden input serves every upload button on the page. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadMutation.mutate(file);
          e.target.value = '';
        }}
      />
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
            <div className="flex flex-wrap justify-center gap-3">
              {canGenerate ? (
                <Button
                  leftIcon={<Sparkles className="h-4 w-4" />}
                  isLoading={generateMutation.isPending}
                  onClick={() => generateMutation.mutate()}
                >
                  Generate concepts
                </Button>
              ) : null}
              <Button
                variant="outline"
                leftIcon={<Upload className="h-4 w-4" />}
                isLoading={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload your own design
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {flyer.versions.length > 0 ? (
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Designs
              <span className="ml-2 text-sm font-normal text-slate-500">
                {flyer.versions.length} {flyer.versions.length === 1 ? 'version' : 'versions'}
              </span>
            </h2>
            {!isApproved ? (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Upload className="h-4 w-4" />}
                isLoading={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload design
              </Button>
            ) : null}
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

            <BackSidePicker
              options={backOptions}
              value={backFlyerId}
              onChange={setBackFlyerId}
            />

            <Button
              variant="outline"
              isLoading={proofMutation.isPending}
              onClick={() => proofMutation.mutate(current.id)}
            >
              {backFlyerId ? 'Build two-sided proof' : 'Build print-ready proof'}
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
            <BackSidePicker
              options={backOptions}
              value={backFlyerId}
              onChange={setBackFlyerId}
            />
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                isLoading={proofMutation.isPending}
                onClick={() => current && proofMutation.mutate(current.id)}
              >
                {backFlyerId ? 'Build two-sided print file' : 'Build print file'}
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
 * Choose what prints on the back. Only APPROVED flyers are offered: a proof
 * with an unapproved back would render, but it could never be ordered, and
 * offering it here just manufactures a dead end.
 */
function BackSidePicker({
  options,
  value,
  onChange,
}: {
  options: { id: string; title: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <Layers className="h-4 w-4 text-slate-400" />
        Print on both sides?
      </label>
      <select
        className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Front only (single-sided)</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            Back: {option.title}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-500">
        Pick another approved design — a translation, for example — and both sides come out
        aligned, ready for double-sided printing or cutting.
      </p>
    </div>
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
        {document.isDoubleSided ? (
          <>
            <p className="text-slate-600">
              Sides: <span className="font-medium text-slate-900">Double-sided (2 pages)</span>
            </p>
            {document.backEffectiveDpi !== null ? (
              <p className="text-slate-600">
                Back resolution:{' '}
                <span className="font-medium text-slate-900">
                  {document.backEffectiveDpi} DPI
                </span>
              </p>
            ) : null}
            {/* effectiveDpi is deliberately the WORSE of the two sides —
                it is what the ordering gate reads. Labelled as such, so it
                is never mistaken for the back figure printed above it; the
                warnings below name each side explicitly. */}
            <p className="text-slate-600">
              Lowest of both sides:{' '}
              <span className="font-medium text-slate-900">{document.effectiveDpi} DPI</span>
            </p>
          </>
        ) : null}
      </div>

      {document.duplexInstruction ? (
        <p className="flex items-start gap-1.5 text-sm text-slate-700">
          <Layers className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          {document.duplexInstruction}
        </p>
      ) : null}

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
