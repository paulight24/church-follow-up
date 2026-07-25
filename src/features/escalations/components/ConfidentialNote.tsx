import { useState } from 'react';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

interface ConfidentialNoteProps {
  content: string;
  className?: string;
}

export function ConfidentialNote({ content, className }: ConfidentialNoteProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div
      className={cn(
        'rounded-lg border border-rose-200 bg-rose-50',
        className,
      )}
    >
      <div className="relative p-4">
        {!isRevealed ? (
          <>
            <div className="select-none blur-sm" aria-hidden="true">
              <p className="text-sm text-slate-700">{content}</p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Lock className="h-6 w-6 text-rose-400" />
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Unlock className="h-3.5 w-3.5" />}
                onClick={() => setIsRevealed(true)}
              >
                Reveal
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{content}</p>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Lock className="h-3.5 w-3.5" />}
                onClick={() => setIsRevealed(false)}
              >
                Hide
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-rose-200 bg-rose-100/50 px-4 py-2">
        <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
        <p className="text-xs text-rose-600">
          This content is confidential and should only be viewed by authorized
          personnel
        </p>
      </div>
    </div>
  );
}
