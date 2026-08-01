import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Maximize2,
  Printer,
  QrCode as QrCodeIcon,
  RefreshCw,
  ShieldOff,
  X,
} from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import type { Service } from '@/types/attendance';
import { SERVICE_TYPE_LABELS } from '@/types/attendance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { attendanceApi } from '../api/attendance.api';
import { QrCode } from './QrCode';

type WindowState = 'disabled' | 'not-open' | 'open' | 'closed';

function toLocalInputValue(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getWindowState(service: Service): WindowState {
  if (!service.checkInEnabled) return 'disabled';
  const now = Date.now();
  if (service.checkInOpensAt && now < new Date(service.checkInOpensAt).getTime()) return 'not-open';
  if (service.checkInClosesAt && now > new Date(service.checkInClosesAt).getTime()) return 'closed';
  return 'open';
}

const windowStateConfig: Record<WindowState, { label: string; variant: 'gray' | 'warning' | 'success' | 'danger' }> = {
  disabled: { label: 'Check-in disabled', variant: 'gray' },
  'not-open': { label: 'Not open yet', variant: 'warning' },
  open: { label: 'Open now', variant: 'success' },
  closed: { label: 'Window has passed', variant: 'danger' },
};

interface CheckInPanelProps {
  service: Service;
}

export function CheckInPanel({ service }: CheckInPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showWindowForm, setShowWindowForm] = useState(false);
  const [rotateConfirmOpen, setRotateConfirmOpen] = useState(false);
  const [presentationOpen, setPresentationOpen] = useState(false);

  const windowState = getWindowState(service);
  const config = windowStateConfig[windowState];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['service', service.id] });
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };

  const generateMutation = useMutation({
    mutationFn: () =>
      attendanceApi.generateCheckInCode(service.id, {
        opensAt: opensAt ? new Date(opensAt).toISOString() : undefined,
        closesAt: closesAt ? new Date(closesAt).toISOString() : undefined,
      }),
    onSuccess: () => {
      toast({ title: 'Check-in code generated', variant: 'success' });
      setShowWindowForm(false);
      setFormError(null);
      invalidate();
    },
    onError: (error: AxiosError<ApiError>) => {
      setFormError(error.response?.data?.message ?? 'Could not generate a check-in code.');
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => attendanceApi.disableCheckInCode(service.id),
    onSuccess: () => {
      toast({ title: 'Check-in disabled', variant: 'success' });
      invalidate();
    },
    onError: (error: AxiosError<ApiError>) => {
      toast({ title: 'Could not disable check-in', description: error.response?.data?.message, variant: 'error' });
    },
  });

  const hasCode = !!service.checkInToken && service.checkInEnabled;
  // The backend returns the full check-in URL, but the Service record itself
  // only stores the token - reconstruct nothing here, we just rely on the
  // most recent generate response for the URL and otherwise show the token.
  const [checkInUrl, setCheckInUrl] = useState<string | null>(null);

  useEffect(() => {
    // A fresh generate() call always carries the URL; if the page was reloaded
    // and we only have a token from the service record, fall back to
    // rendering the token itself so the panel still shows *something*
    // scannable-looking rather than silently hiding the QR.
    if (generateMutation.data) {
      setCheckInUrl(generateMutation.data.data.checkInUrl);
    }
  }, [generateMutation.data]);

  const qrValue = checkInUrl ?? service.checkInToken ?? '';

  function openWindowForm() {
    setOpensAt(toLocalInputValue(new Date().toISOString()));
    setClosesAt(toLocalInputValue(new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()));
    setFormError(null);
    setShowWindowForm(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <QrCodeIcon className="h-4 w-4 text-slate-400" />
          <CardTitle className="text-base">Self Check-In QR</CardTitle>
        </div>
        <Badge variant={config.variant} dot size="sm">
          {config.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasCode ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Generate a QR code members can scan to check themselves in to this service.
            </p>
            {!showWindowForm ? (
              <Button leftIcon={<QrCodeIcon className="h-4 w-4" />} onClick={openWindowForm}>
                Enable Check-In
              </Button>
            ) : (
              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                {formError && <Alert variant="error">{formError}</Alert>}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Opens at"
                    type="datetime-local"
                    value={opensAt}
                    onChange={(e) => setOpensAt(e.target.value)}
                  />
                  <Input
                    label="Closes at"
                    type="datetime-local"
                    value={closesAt}
                    onChange={(e) => setClosesAt(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowWindowForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    isLoading={generateMutation.isPending}
                    onClick={() => {
                      setFormError(null);
                      generateMutation.mutate();
                    }}
                  >
                    Generate Code
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <QrCode value={qrValue} size={160} aria-label={`Check-in QR code for ${service.name}`} />
              </div>
              <div className="flex-1 space-y-2 text-sm">
                <p className="flex items-center gap-1.5 text-slate-600">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  Opens {service.checkInOpensAt ? formatDateTime(service.checkInOpensAt) : '--'}
                </p>
                <p className="flex items-center gap-1.5 text-slate-600">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  Closes {service.checkInClosesAt ? formatDateTime(service.checkInClosesAt) : '--'}
                </p>
                {windowState !== 'open' && (
                  <p className="text-xs text-slate-400">
                    Members can still scan the code, but check-in will only be accepted while the window above
                    is active.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Maximize2 className="h-4 w-4" />}
                onClick={() => setPresentationOpen(true)}
              >
                Presentation Mode
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={() => setRotateConfirmOpen(true)}
              >
                Rotate Code
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ShieldOff className="h-4 w-4 text-rose-500" />}
                isLoading={disableMutation.isPending}
                onClick={() => disableMutation.mutate()}
              >
                Disable Check-In
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={rotateConfirmOpen}
        onClose={() => setRotateConfirmOpen(false)}
        onConfirm={() => {
          setFormError(null);
          generateMutation.mutate();
        }}
        title="Rotate check-in code"
        message="This invalidates the current QR code immediately. Anyone still holding the old code (printed or on screen) will no longer be able to check in with it — only do this between services, not mid-service."
        confirmText="Rotate Code"
        variant="warning"
      />

      {presentationOpen && (
        <PresentationOverlay service={service} qrValue={qrValue} onClose={() => setPresentationOpen(false)} />
      )}

      {hasCode && <PrintLayout service={service} qrValue={qrValue} />}
    </Card>
  );
}

// ─── Presentation mode (projected on screen) ───────────────────────────

function PresentationOverlay({
  service,
  qrValue,
  onClose,
}: {
  service: Service;
  qrValue: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const qrSize = useMemo(() => Math.min(560, typeof window !== 'undefined' ? window.innerHeight * 0.55 : 560), []);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-white p-8 print:hidden">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-label="Exit presentation mode"
      >
        <X className="h-8 w-8" />
      </button>

      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">{service.name}</h1>
        <p className="mt-2 text-xl text-slate-500">
          {SERVICE_TYPE_LABELS[service.serviceType] ?? service.serviceType} · {formatDate(service.serviceDate)}
        </p>
      </div>

      <QrCode value={qrValue} size={qrSize} aria-label={`Check-in QR code for ${service.name}`} />

      <p className="text-2xl font-medium text-slate-700">Scan to check in</p>
    </div>,
    document.body,
  );
}

// ─── Print-friendly layout ──────────────────────────────────────────────
// Hidden on screen, shown only when printing (Tailwind's `print:` variant),
// so `window.print()` from the button above produces just this page.

function PrintLayout({ service, qrValue }: { service: Service; qrValue: string }) {
  return (
    <div className="hidden print:fixed print:inset-0 print:z-[300] print:flex print:flex-col print:items-center print:justify-center print:gap-6 print:bg-white print:p-12">
      <p className="text-lg font-medium text-slate-500">Scan to check in</p>
      <h1 className="text-3xl font-bold text-slate-900">{service.name}</h1>
      <p className="text-xl text-slate-600">
        {SERVICE_TYPE_LABELS[service.serviceType] ?? service.serviceType} · {formatDate(service.serviceDate)}
      </p>
      <QrCode value={qrValue} size={360} aria-label={`Check-in QR code for ${service.name}`} />
      {service.checkInOpensAt && service.checkInClosesAt && (
        <p className="text-sm text-slate-500">
          Valid {formatDateTime(service.checkInOpensAt)} – {formatDateTime(service.checkInClosesAt)}
        </p>
      )}
    </div>
  );
}
