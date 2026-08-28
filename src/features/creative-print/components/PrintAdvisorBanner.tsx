import { CalendarClock, ExternalLink, Printer } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import type { PrintAdvice } from '@/types/creativePrint';

/**
 * What the deadline actually allows.
 *
 * This sits above the options rather than beside the total, because it is
 * meant to change the decision, not decorate it. When nothing can arrive in
 * time the honest answer is not a faster shipping option — it is "download
 * the file and walk into a print shop today", and that is what this says.
 * `advice.message` is written for a volunteer and is rendered verbatim.
 */
export function PrintAdvisorBanner({
  advice,
  eventName,
  onDownload,
}: {
  advice: PrintAdvice;
  eventName: string | null;
  onDownload?: () => void;
}) {
  if (advice.tooLate) {
    return (
      <Alert variant="warning" title="These will not arrive in time">
        <p>{advice.message}</p>
        <p className="mt-2 font-medium">
          Download the print-ready PDF and take it to a print shop today. That is the only route
          that gets flyers into hands before {eventName ?? 'the event'}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {onDownload ? (
            <Button size="sm" variant="outline" leftIcon={<Printer className="h-4 w-4" />} onClick={onDownload}>
              Download the print file
            </Button>
          ) : null}
          {advice.selfPrintUrl ? (
            <a
              href={advice.selfPrintUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Find a print shop near you
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
        <p className="mt-3 text-sm">
          You can still order copies to arrive later — for the next time you need them.
        </p>
      </Alert>
    );
  }

  return (
    <Alert variant="info" title="Timing">
      <p className="flex items-start gap-1.5">
        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
        {advice.message}
      </p>
    </Alert>
  );
}
