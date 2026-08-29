import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { useTranslation } from '@/i18n';

/**
 * "Bring someone with you" — the invitation's own forward button.
 *
 * A registration page can only be found by someone who was already sent the
 * link, so the page's reach is capped by whoever the church could reach
 * directly. This turns each visitor into a sender: WhatsApp opens with the
 * invitation already written and they only choose who to send it to.
 *
 * WhatsApp first because that is where this congregation's family groups
 * actually live. Everything else is a fallback, in order of how likely it is
 * to work: the phone's own share sheet when the browser has one, and a copy
 * button that always does.
 */
interface ShareEventCardProps {
  eventName: string;
  /** Already-formatted and localised, e.g. "Sunday, August 30 · 10:30 AM". */
  when: string;
  location?: string | null;
  /** Public page URL. Defaults to wherever the visitor already is. */
  url?: string;
}

export function ShareEventCard({ eventName, when, location, url }: ShareEventCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // The page the visitor is standing on is the page worth sending. Guarded
  // for the server-render / test case where there is no window.
  const shareUrl =
    url ?? (typeof window !== 'undefined' ? window.location.href : '');
  if (!shareUrl) return null;

  // Just the venue name. The full postal address turns a WhatsApp preview
  // into three lines of zip code and tells the reader nothing.
  const venue = location?.split(',')[0]?.trim();
  const message = [t('event.shareLead', { event: eventName }), when, venue]
    .filter(Boolean)
    .join('\n')
    .concat(`\n\n${shareUrl}`);

  // encodeURIComponent leaves the apostrophe in "You're" alone, which some
  // link handlers then mangle; encoding it here leaves nothing to mangle.
  const encoded = encodeURIComponent(message).replace(/'/g, '%27');

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is permission-gated and blocked outright in some in-app
      // browsers. Selecting the text is the honest fallback; silently
      // pretending it copied would be worse.
      window.prompt(t('event.shareCopyManual'), shareUrl);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: eventName, text: message, url: shareUrl });
    } catch {
      // Includes the visitor simply dismissing the sheet — not an error.
    }
  }

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">{t('event.shareTitle')}</h2>
      <p className="mt-1 text-sm text-slate-600">{t('event.shareBody')}</p>

      <a
        href={`https://wa.me/?text=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1eb855] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25d366] focus-visible:ring-offset-2"
      >
        {/* WhatsApp's mark, inline so the button needs no network request. */}
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
        </svg>
        {t('event.shareWhatsApp')}
      </a>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              {t('event.shareCopied')}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {t('event.shareCopy')}
            </>
          )}
        </button>

        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <Share2 className="h-4 w-4" />
            {t('event.shareMore')}
          </button>
        )}
      </div>
    </div>
  );
}
