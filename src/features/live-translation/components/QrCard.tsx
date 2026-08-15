import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Maximize2, QrCode as QrCodeIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

interface QrCardProps {
  /** The church's public listener URL, e.g. https://app.example/live/ce-la */
  url: string;
}

/**
 * "Listen to Live Translation" QR (spec §32): copyable link + a full-screen
 * mode designed to sit on the projector before/during service.
 */
export function QrCard({ url }: QrCardProps) {
  const { toast } = useToast();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [bigDataUrl, setBigDataUrl] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { width: 240, margin: 1 }).then((d) => {
      if (!cancelled) setDataUrl(d);
    });
    QRCode.toDataURL(url, { width: 720, margin: 2 }).then((d) => {
      if (!cancelled) setBigDataUrl(d);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', variant: 'success' });
    } catch {
      toast({ title: 'Could not copy — long-press the link instead', variant: 'error' });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCodeIcon className="h-4 w-4 text-indigo-600" />
            Listen to Live Translation
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          {dataUrl ? (
            <img src={dataUrl} alt="QR code for the live translation page" className="h-44 w-44 rounded-lg border border-slate-200" />
          ) : (
            <div className="h-44 w-44 animate-pulse rounded-lg bg-slate-100" />
          )}
          <p className="max-w-full truncate text-center text-xs text-slate-500">{url}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={copyLink}>
              Copy link
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Maximize2 className="h-3.5 w-3.5" />}
              onClick={() => setFullscreen(true)}
            >
              Full screen
            </Button>
          </div>
        </CardContent>
      </Card>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[90] flex cursor-pointer flex-col items-center justify-center gap-8 bg-white p-8"
          onClick={() => setFullscreen(false)}
          role="button"
          aria-label="Close full screen QR"
        >
          <h1 className="text-center text-4xl font-bold text-slate-900 sm:text-5xl">
            Hear today&apos;s service in your language
          </h1>
          {bigDataUrl && <img src={bigDataUrl} alt="QR code" className="h-[45vh] w-[45vh] max-w-full" />}
          <p className="text-center text-2xl text-slate-600 sm:text-3xl">
            Scan → Choose Language → Listen
          </p>
          <p className="text-center text-xl font-medium text-indigo-700">{url}</p>
          <p className="text-sm text-slate-400">Click anywhere to close</p>
        </div>
      )}
    </>
  );
}
