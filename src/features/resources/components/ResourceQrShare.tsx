import { useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QrCode } from '@/features/attendance/components/QrCode';

/**
 * The printed link and its QR code. Same dependency-free encoder the service
 * check-in and event pages already use, rather than a third implementation.
 *
 * The copy here leans on the one property that makes this page worth having:
 * the code stays valid while the material behind it changes, so it is safe to
 * commit to paper.
 */
export function ResourceQrShare({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/r/${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (insecure context, permissions).
      // The URL is selectable in the input, so this stays a silent no-op.
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Link2 className="h-4 w-4 text-slate-400" />
        <CardTitle className="text-base">Public link &amp; QR code</CardTitle>
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
            <QrCode value={url} size={160} aria-label={`Resource page QR code for ${title}`} />
          </div>
          <p className="flex-1 text-sm text-slate-600">
            Safe to print. Whoever scans it sees whatever this page holds at that moment — you can
            swap every resource behind it later without reprinting anything, which is the whole
            reason the QR points here instead of straight at a file.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
