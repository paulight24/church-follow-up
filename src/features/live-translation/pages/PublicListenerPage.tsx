/**
 * Public listener page — /live/:slug (spec §14). Phone-first, one-handed,
 * no login: scan the QR → pick a language once → one big Listen button.
 * The saved language is auto-selected on the next visit (spec §15,
 * localStorage — anonymous visitors have no profile).
 *
 * Audio arrives as PCM frames over a WebSocket identified ONLY by the
 * session's opaque public code; playback needs one tap because mobile
 * browsers require a user gesture to start audio.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Captions, ChevronLeft, Headphones, Pause } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/ui/Spinner';
import { getPublicLiveInfo } from '../api/liveTranslation.api';
import { PcmPlayer } from '../lib/pcmPlayer';
import { wsBaseUrl } from '../lib/wsUrl';

const PREF_KEY = 'liveTranslation.preferredLanguage';

type ListenState =
  | 'idle' // language chosen, not listening yet
  | 'connecting'
  | 'listening'
  | 'paused-by-user'
  | 'reconnecting'
  | 'waiting' // service not started yet
  | 'ended';

export function PublicListenerPage() {
  const { slug = '' } = useParams();

  const infoQuery = useQuery({
    queryKey: ['public-live', slug],
    queryFn: () => getPublicLiveInfo(slug),
    refetchInterval: (query) => (query.state.data?.live ? 30_000 : 12_000),
    retry: 1,
  });

  const [language, setLanguage] = useState<string | null>(() => localStorage.getItem(PREF_KEY));
  const [state, setState] = useState<ListenState>('idle');
  const [captionsOn, setCaptionsOn] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [serverPaused, setServerPaused] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [listenerCount, setListenerCount] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<PcmPlayer | null>(null);
  const wantListenRef = useRef(false);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const info = infoQuery.data;
  const live = info?.live ?? null;

  // Server-side language availability may differ from the saved preference.
  const availableCodes = live?.languages.map((l) => l.code) ?? [];
  const effectiveLanguage = language && availableCodes.includes(language) ? language : null;

  const disconnect = useCallback((nextState: ListenState) => {
    wantListenRef.current = false;
    if (retryRef.current) clearTimeout(retryRef.current);
    retryRef.current = null;
    const ws = wsRef.current;
    wsRef.current = null;
    ws?.close(1000, 'listener left');
    setState(nextState);
  }, []);

  const connect = useCallback(
    (code: string, lang: string) => {
      if (retryRef.current) clearTimeout(retryRef.current);
      retryRef.current = null;
      setState((prev) => (prev === 'listening' ? 'reconnecting' : 'connecting'));

      const ws = new WebSocket(`${wsBaseUrl()}/ws/live/listen?code=${encodeURIComponent(code)}&lang=${encodeURIComponent(lang)}`);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onmessage = (event) => {
        if (typeof event.data !== 'string') {
          playerRef.current?.enqueue(event.data as ArrayBuffer);
          return;
        }
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'status') {
            if (typeof msg.audioRate === 'number') playerRef.current?.setSampleRate(msg.audioRate);
            if (typeof msg.paused === 'boolean') setServerPaused(msg.paused);
            if (typeof msg.listeners === 'number') setListenerCount(msg.listeners);
            if (msg.waiting) {
              setState('waiting');
            } else if (msg.live) {
              setState('listening');
            }
            setNotice(msg.translationDown ? (msg.message ?? 'Translation is temporarily unavailable.') : null);
          } else if (msg.type === 'caption') {
            setCaptions((prev) => [...prev.slice(-5), msg.text]);
          } else if (msg.type === 'ended') {
            wantListenRef.current = false;
            setState('ended');
          }
        } catch {
          /* ignore malformed frame */
        }
      };

      ws.onclose = (event) => {
        if (wsRef.current !== ws) return;
        wsRef.current = null;
        if (!wantListenRef.current) return;
        if (event.code === 4200) {
          // Not started yet — keep checking quietly until the operator starts.
          setState('waiting');
          retryRef.current = setTimeout(() => connect(code, lang), 8_000);
        } else if (event.code === 4404) {
          wantListenRef.current = false;
          setState('ended');
        } else {
          setState('reconnecting');
          retryRef.current = setTimeout(() => connect(code, lang), 3_000);
        }
      };
    },
    []
  );

  const startListening = useCallback(
    (lang: string) => {
      if (!live) return;
      localStorage.setItem(PREF_KEY, lang);
      setLanguage(lang);
      setCaptions([]);
      if (!playerRef.current) playerRef.current = new PcmPlayer(24000);
      // Unlock audio inside the tap, but never block the connection on it:
      // if the browser still withholds audio, captions and status must flow
      // anyway, and the next tap (Pause→Listen) unlocks playback.
      void playerRef.current.unlock().catch(() => undefined);
      playerRef.current.setMuted(false);
      wantListenRef.current = true;
      connect(live.publicCode, lang);
    },
    [live, connect]
  );

  const pauseListening = useCallback(() => {
    playerRef.current?.setMuted(true);
    disconnect('paused-by-user');
  }, [disconnect]);

  // Some browsers (notably iOS Safari) refuse to start audio until a
  // "clean" gesture: while listening, any tap retries the unlock.
  useEffect(() => {
    if (state !== 'listening') return;
    const retryUnlock = () => void playerRef.current?.unlock().catch(() => undefined);
    document.addEventListener('touchend', retryUnlock);
    document.addEventListener('click', retryUnlock);
    return () => {
      document.removeEventListener('touchend', retryUnlock);
      document.removeEventListener('click', retryUnlock);
    };
  }, [state]);

  // Full teardown when the page unmounts.
  useEffect(() => {
    return () => {
      wantListenRef.current = false;
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close(1000, 'left page');
      void playerRef.current?.close();
    };
  }, []);

  // ── render ──

  if (infoQuery.isLoading) {
    return (
      <Shell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      </Shell>
    );
  }

  if (infoQuery.isError || !info) {
    return (
      <Shell>
        <CenterCard emoji="🙏" title="Page not found" body="Check the link with your church's media team." />
      </Shell>
    );
  }

  const listeningView = effectiveLanguage && state !== 'idle' && state !== 'ended';

  return (
    <Shell churchName={info.churchName}>
      {!live ? (
        <CenterCard
          emoji="⛪"
          title="No live service right now"
          body="When the service starts, this page will update by itself — keep it open."
        />
      ) : state === 'ended' ? (
        <CenterCard
          emoji="🕊️"
          title="The live service has ended."
          body="Thank you for joining. God bless you!"
        />
      ) : !listeningView ? (
        /* ── language chooser ── */
        <div className="space-y-4">
          <div className="text-center">
            <LivePill status={live.status} />
            <h2 className="mt-3 text-xl font-bold text-slate-900">{live.title}</h2>
            <p className="mt-1 text-sm text-slate-500">Choose your language</p>
          </div>
          <div className="space-y-2">
            {live.languages.map((lang) => {
              const isSaved = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => startListening(lang.code)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-2xl border-2 px-4 py-4 text-left transition-colors active:scale-[0.99]',
                    isSaved
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-indigo-300'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>
                      {lang.flag}
                    </span>
                    <span>
                      <span className="block text-base font-semibold text-slate-900">{lang.nativeName}</span>
                      {lang.nativeName !== lang.englishName && (
                        <span className="block text-xs text-slate-500">{lang.englishName}</span>
                      )}
                    </span>
                  </span>
                  {isSaved && <span className="text-xs font-medium text-indigo-600">Your language</span>}
                </button>
              );
            })}
          </div>
          <p className="text-center text-xs text-slate-400">
            Use your own earphones — AirPods, wired, anything works.
          </p>
        </div>
      ) : (
        /* ── listening view ── */
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <LivePill status={live.status} />
            <h2 className="mt-3 text-lg font-bold text-slate-900">{live.title}</h2>
            <p className="mt-0.5 text-2xl font-semibold text-indigo-700">
              {live.languages.find((l) => l.code === effectiveLanguage)?.nativeName ?? effectiveLanguage}
            </p>
          </div>

          {/* the one big control */}
          <button
            type="button"
            onClick={() => (state === 'paused-by-user' ? startListening(effectiveLanguage) : pauseListening())}
            className={cn(
              'flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-full text-white shadow-lg transition-transform active:scale-95',
              state === 'paused-by-user' ? 'bg-indigo-600' : 'bg-rose-600'
            )}
            aria-label={state === 'paused-by-user' ? 'Listen' : 'Pause'}
          >
            {state === 'paused-by-user' ? (
              <>
                <Headphones className="h-12 w-12" />
                <span className="text-sm font-semibold">LISTEN</span>
              </>
            ) : (
              <>
                <Pause className="h-12 w-12" />
                <span className="text-sm font-semibold">PAUSE</span>
              </>
            )}
          </button>

          <p className="min-h-5 text-sm text-slate-500" role="status">
            {state === 'connecting' && 'Connecting…'}
            {state === 'reconnecting' && 'Reconnecting…'}
            {state === 'waiting' && 'The service will start soon — stay on this page.'}
            {state === 'paused-by-user' && 'Paused'}
            {state === 'listening' &&
              (notice ?? (serverPaused ? 'Worship in progress — translation resumes shortly.' : 'Pastor is speaking…'))}
          </p>

          {/* captions */}
          <div className="w-full">
            <button
              type="button"
              onClick={() => setCaptionsOn((v) => !v)}
              className={cn(
                'mx-auto flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm',
                captionsOn ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-600'
              )}
              aria-pressed={captionsOn}
            >
              <Captions className="h-4 w-4" /> {captionsOn ? 'Hide captions' : 'Show captions'}
            </button>
            {captionsOn && (
              <div className="mt-3 min-h-24 rounded-2xl bg-slate-900 p-4 text-center text-base leading-relaxed text-white">
                {captions.length === 0 ? (
                  <span className="text-slate-400">Captions appear as Pastor speaks…</span>
                ) : (
                  captions.map((line, i) => (
                    <p key={i} className={cn(i === captions.length - 1 ? 'opacity-100' : 'opacity-50')}>
                      {line}
                    </p>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            {listenerCount !== null && <span>{listenerCount} listening in your language</span>}
            <button
              type="button"
              className="flex items-center gap-1 text-indigo-600"
              onClick={() => {
                pauseListening();
                setState('idle');
              }}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Change language
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children, churchName }: { children: React.ReactNode; churchName?: string }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">{churchName ?? 'Live Translation'}</span>
          <span className="text-xs text-slate-400">Live Translation</span>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-6">{children}</main>
    </div>
  );
}

function LivePill({ status }: { status: 'LIVE' | 'READY' }) {
  return status === 'LIVE' ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
      </span>
      LIVE NOW
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
      Starting soon
    </span>
  );
}

function CenterCard({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="max-w-xs text-sm text-slate-500">{body}</p>
    </div>
  );
}
