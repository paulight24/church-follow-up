import { Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface WhatsAppSharePanelProps {
  message: string;
  imageUrl?: string | null;
}

/**
 * Genuinely useful WhatsApp affordance that needs no WhatsApp Business API
 * approval: builds a wa.me deep link with the composed message (and image
 * URL, if one is attached) pre-filled, and opens it so the Pastor can post it
 * himself to his own groups/broadcast lists. This is a client-side share
 * action - it never touches the dispatch pipeline and the system never
 * claims to have delivered a WhatsApp message.
 */
export function WhatsAppSharePanel({ message, imageUrl }: WhatsAppSharePanelProps) {
  const fullText = [message.trim(), imageUrl].filter(Boolean).join('\n\n');
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
  const isEmpty = !message.trim();

  return (
    <Card className="border-emerald-200 bg-emerald-50/60">
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-900">Share to WhatsApp</p>
        </div>
        <p className="text-xs text-emerald-800">
          This does not send anything automatically. It opens WhatsApp with your message (and the image link, if
          attached) pre-filled, ready for you to post to your own groups or broadcast lists.
        </p>
        <div className="whitespace-pre-wrap rounded-lg border border-emerald-200 bg-white p-3 text-sm text-slate-700">
          {fullText || 'Your message will appear here...'}
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
          disabled={isEmpty}
          leftIcon={<Share2 className="h-4 w-4" />}
          onClick={() => window.open(shareUrl, '_blank', 'noopener,noreferrer')}
        >
          Open in WhatsApp
        </Button>
      </CardContent>
    </Card>
  );
}
