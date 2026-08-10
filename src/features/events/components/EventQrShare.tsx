import { useState } from 'react';
import { Check, Copy, Link2, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QrCode } from '@/features/attendance/components/QrCode';

interface EventQrShareProps {
  slug: string;
  eventName: string;
}

/**
 * The public registration link + its QR code, prominently surfaced on the event detail page.
 * Reuses the existing dependency-free QR encoder/renderer from the attendance feature
 * (src/features/attendance/lib/qrcode.ts + components/QrCode.tsx) - the same one that
 * already powers service check-in QR codes - rather than a second implementation.
 */
export function EventQrShare({ slug, eventName }: EventQrShareProps) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/e/${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (insecure context, permissions) - the URL is
      // still visible and selectable in the input, so this is a silent no-op rather than
      // an error the admin needs to see.
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Link2 className="h-4 w-4 text-slate-400" />
        <CardTitle className="text-base">Public Registration Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={url} readOnly className="font-mono text-xs" onFocus={(e) => e.target.select()} />
          <Button
            variant="outline"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            className="shrink-0"
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        <div className="flex flex-col items-start gap-4 border-t border-slate-100 pt-4 sm:flex-row">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <QrCode value={url} size={160} aria-label={`Registration QR code for ${eventName}`} />
          </div>
          <div className="flex-1 space-y-3 text-sm text-slate-600">
            <p>
              Print this QR code on a flier - anyone who scans it opens the registration page
              directly on their phone, no app or login needed.
            </p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => window.print()}
            >
              Print flier QR
            </Button>
          </div>
        </div>
      </CardContent>

      <PrintLayout eventName={eventName} url={url} />
    </Card>
  );
}

// Hidden on screen, shown only when printing (mirrors CheckInPanel's print layout pattern
// in src/features/attendance/components/CheckInPanel.tsx), so the Print button above
// produces just this page rather than the whole admin UI.
function PrintLayout({ eventName, url }: { eventName: string; url: string }) {
  return (
    <div className="hidden print:fixed print:inset-0 print:z-[300] print:flex print:flex-col print:items-center print:justify-center print:gap-6 print:bg-white print:p-12">
      <p className="text-lg font-medium text-slate-500">Scan to register</p>
      <h1 className="text-3xl font-bold text-slate-900">{eventName}</h1>
      <QrCode value={url} size={360} aria-label={`Registration QR code for ${eventName}`} />
      <p className="text-sm text-slate-500">{url}</p>
    </div>
  );
}
