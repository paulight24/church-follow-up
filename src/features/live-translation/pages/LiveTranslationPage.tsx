/**
 * Live Translation operator console (spec §8). Built for a church volunteer
 * on the media laptop: plain words only (no sockets/codecs/providers in the
 * UI — spec §36), one obvious START, one obvious END, and a health strip
 * that says "Audio: Excellent / AI: Connected" instead of error codes.
 *
 * Flow: pick audio device (live level meter) → pick languages → START (with
 * confirmation) → console streams mic/mixer audio to the backend over a
 * ticket-authed WebSocket. Listener phones join via the QR. Ending — or the
 * backend's own hard-stop timer — closes every translation stream.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock,
  Headphones,
  Languages as LanguagesIcon,
  Mic,
  Pause,
  Play,
  Plus,
  Radio,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import {
  liveTranslationApi,
  type LiveSessionSnapshot,
  type SessionSummary,
} from '../api/liveTranslation.api';
import { QrCard } from '../components/QrCard';
import { LANGUAGE_CATALOG, displayName, languageByCode } from '../lib/languages';
import { listAudioInputs, startCapture, type AudioInputDevice, type CaptureHandle } from '../lib/audioCapture';
import { PcmPlayer } from '../lib/pcmPlayer';
import { wsBaseUrl } from '../lib/wsUrl';

const DURATION_OPTIONS = [
  { label: '1 hour', value: '60' },
  { label: '1.5 hours', value: '90' },
  { label: '2 hours (recommended)', value: '120' },
  { label: '3 hours', value: '180' },
];

function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

export function LiveTranslationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ── server state ──
  const settingsQuery = useQuery({
    queryKey: ['live-translation', 'settings'],
    queryFn: () => liveTranslationApi.getSettings().then((r) => r.data),
  });
  const currentQuery = useQuery({
    queryKey: ['live-translation', 'current'],
    queryFn: () => liveTranslationApi.getCurrent().then((r) => r.data),
  });

  const settings = settingsQuery.data;

  // ── console state ──
  const [snapshot, setSnapshot] = useState<LiveSessionSnapshot | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [warningMinutes, setWarningMinutes] = useState<number | null>(null);
  const [connectionNote, setConnectionNote] = useState<string | null>(null);

  // setup form
  const [title, setTitle] = useState('Sunday Service');
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [allowCodeSwitching, setAllowCodeSwitching] = useState(true);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [durationMinutes, setDurationMinutes] = useState('120');
  const [confirmStartOpen, setConfirmStartOpen] = useState(false);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [addLangOpen, setAddLangOpen] = useState(false);

  // audio
  const [devices, setDevices] = useState<AudioInputDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const captureRef = useRef<CaptureHandle | null>(null);
  const ingestWsRef = useRef<WebSocket | null>(null);
  const liveRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // pre-service test
  const [testOpen, setTestOpen] = useState(false);
  const [testLang, setTestLang] = useState('');
  const [testState, setTestState] = useState<'idle' | 'running' | 'ended'>('idle');
  const [testCaptions, setTestCaptions] = useState<string[]>([]);
  const testWsRef = useRef<WebSocket | null>(null);
  const testPlayerRef = useRef<PcmPlayer | null>(null);

  // Seed the form from server state once loaded.
  useEffect(() => {
    if (!settings) return;
    setSourceLanguage((prev) => (prev === 'en-US' ? settings.sourceLanguage : prev));
    setSelectedLangs((prev) => (prev.length > 0 ? prev : settings.availableTargetLanguages.slice(0, 3)));
    setDurationMinutes((prev) => (prev === '120' ? String(settings.defaultSessionMinutes) : prev));
  }, [settings]);

  useEffect(() => {
    const data = currentQuery.data;
    if (!data) return;
    if (data.session) {
      setSnapshot(data.session);
      if (data.targetLanguages && data.targetLanguages.length > 0) setSelectedLangs(data.targetLanguages);
      setTitle(data.session.title);
      setSourceLanguage(data.session.sourceLanguage);
    }
  }, [currentQuery.data]);

  // ── audio device list + local level meter ──
  useEffect(() => {
    let cancelled = false;
    listAudioInputs()
      .then((list) => {
        if (cancelled) return;
        setDevices(list);
        setDeviceId((prev) => prev || list[0]?.deviceId || '');
        setDeviceError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setDeviceError('Microphone access was blocked. Allow it in the browser address bar, then reload.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const restartCapture = useCallback(async (id: string) => {
    captureRef.current?.stop();
    captureRef.current = null;
    if (!id) return;
    try {
      const handle = await startCapture(id, {
        onLevel: (rms) => setLevel(rms),
        onChunk: (chunk) => {
          const testWs = testWsRef.current;
          if (testWs && testWs.readyState === WebSocket.OPEN) {
            testWs.send(chunk);
            return;
          }
          const ws = ingestWsRef.current;
          if (liveRef.current && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(chunk);
          }
        },
        onError: (message) => setDeviceError(message),
      });
      captureRef.current = handle;
      setDeviceError(null);
    } catch {
      setDeviceError('Could not open that audio device.');
    }
  }, []);

  useEffect(() => {
    void restartCapture(deviceId);
  }, [deviceId, restartCapture]);

  // Tear everything down when the operator leaves the page. The SESSION
  // keeps running server-side — leaving the console never ends the service.
  useEffect(() => {
    return () => {
      captureRef.current?.stop();
      liveRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      ingestWsRef.current?.close(1000, 'console closed');
      testWsRef.current?.close();
      void testPlayerRef.current?.close();
    };
  }, []);

  // ── ingest socket (live audio feed + state frames) ──
  const connectIngest = useCallback(async (sessionId: string) => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    try {
      const { ticket } = (await liveTranslationApi.getWsTicket()).data;
      const ws = new WebSocket(`${wsBaseUrl()}/ws/live/ingest?ticket=${ticket}&session=${sessionId}`);
      ws.binaryType = 'arraybuffer';
      ingestWsRef.current = ws;

      ws.onopen = () => setConnectionNote(null);
      ws.onmessage = (event) => {
        if (typeof event.data !== 'string') return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'state') setSnapshot(msg.state);
          else if (msg.type === 'transcript') setTranscript((prev) => [...prev.slice(-199), msg.text]);
          else if (msg.type === 'warning') setWarningMinutes(msg.minutesLeft);
          else if (msg.type === 'ended') {
            liveRef.current = false;
            setConnectionNote(null);
          } else if (msg.type === 'error') toast({ title: msg.message, variant: 'warning' });
        } catch {
          /* ignore malformed frame */
        }
      };
      ws.onclose = (event) => {
        if (ingestWsRef.current !== ws) return; // replaced deliberately
        ingestWsRef.current = null;
        if (liveRef.current && event.code !== 1000 && event.code !== 4409) {
          // Connection interrupted — reconnect with a fresh one-time ticket.
          setConnectionNote('Connection interrupted… reconnecting');
          reconnectTimerRef.current = setTimeout(() => void connectIngest(sessionId), 3000);
        }
      };
    } catch {
      if (liveRef.current) {
        setConnectionNote('Connection interrupted… reconnecting');
        reconnectTimerRef.current = setTimeout(() => void connectIngest(sessionId), 3000);
      }
    }
  }, [toast]);

  // Rejoin a session that is already LIVE (page reload during service).
  useEffect(() => {
    if (snapshot?.status === 'LIVE' && !liveRef.current) {
      liveRef.current = true;
      void connectIngest(snapshot.id);
    }
  }, [snapshot?.status, snapshot?.id, connectIngest]);

  // ── mutations ──
  const prepare = useCallback(async () => {
    const created = await liveTranslationApi.createSession({
      title,
      sourceLanguage,
      allowCodeSwitching,
      targetLanguages: selectedLangs,
      audioSourceType: 'BROWSER_MIC',
      audioSourceLabel: captureRef.current?.deviceLabel ?? devices.find((d) => d.deviceId === deviceId)?.label,
    });
    await queryClient.invalidateQueries({ queryKey: ['live-translation', 'current'] });
    return created.data;
  }, [title, sourceLanguage, allowCodeSwitching, selectedLangs, deviceId, devices, queryClient]);

  const startMutation = useMutation({
    mutationFn: async () => {
      const session = await prepare();
      const snap = (await liveTranslationApi.startSession(session.id, parseInt(durationMinutes, 10))).data;
      return snap;
    },
    onSuccess: (snap) => {
      setSnapshot(snap);
      setSummary(null);
      setTranscript([]);
      setWarningMinutes(null);
      liveRef.current = true;
      void connectIngest(snap.id);
      toast({ title: 'Live translation started', variant: 'success' });
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) =>
      toast({ title: err.response?.data?.message ?? 'Could not start', variant: 'error' }),
  });

  const endMutation = useMutation({
    mutationFn: () => liveTranslationApi.endSession(snapshot!.id).then((r) => r.data),
    onSuccess: (result) => {
      liveRef.current = false;
      setSummary(result);
      setSnapshot(null);
      setWarningMinutes(null);
      void queryClient.invalidateQueries({ queryKey: ['live-translation', 'current'] });
      toast({ title: 'Live service ended', variant: 'success' });
    },
    onError: () => toast({ title: 'Could not end the service — try again', variant: 'error' }),
  });

  const extendMutation = useMutation({
    mutationFn: (minutes: 30 | 60) => liveTranslationApi.extendSession(snapshot!.id, minutes),
    onSuccess: (_, minutes) => {
      setWarningMinutes(null);
      toast({ title: `Extended by ${minutes} minutes`, variant: 'success' });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (pause: boolean) =>
      pause ? liveTranslationApi.pauseSession(snapshot!.id) : liveTranslationApi.resumeSession(snapshot!.id),
  });

  const addLanguageToSettings = useMutation({
    mutationFn: (code: string) =>
      liveTranslationApi.updateSettings({
        availableTargetLanguages: [...(settings?.availableTargetLanguages ?? []), code],
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['live-translation', 'settings'] }),
    onError: () => toast({ title: 'Only admins can change the language list', variant: 'error' }),
  });

  // ── pre-service test (spec §33) ──
  const startTest = useCallback(async () => {
    try {
      const session = await prepare();
      const { ticket } = (await liveTranslationApi.getWsTicket()).data;
      const ws = new WebSocket(
        `${wsBaseUrl()}/ws/live/ingest?ticket=${ticket}&session=${session.id}&mode=test&lang=${testLang}`
      );
      ws.binaryType = 'arraybuffer';
      testWsRef.current = ws;
      const player = new PcmPlayer(16000);
      testPlayerRef.current = player;
      await player.unlock();
      setTestCaptions([]);
      setTestState('running');

      ws.onmessage = (event) => {
        if (typeof event.data !== 'string') {
          player.enqueue(event.data as ArrayBuffer);
          return;
        }
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'test-started') player.setSampleRate(msg.sampleRate);
          else if (msg.type === 'caption') setTestCaptions((prev) => [...prev.slice(-9), msg.text]);
          else if (msg.type === 'test-ended') setTestState('ended');
          else if (msg.type === 'error') {
            toast({ title: msg.message, variant: 'error' });
            setTestState('ended');
          }
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        if (testWsRef.current === ws) testWsRef.current = null;
        setTestState((prev) => (prev === 'running' ? 'ended' : prev));
      };
    } catch {
      toast({ title: 'Could not start the test', variant: 'error' });
      setTestState('idle');
    }
  }, [prepare, testLang, toast]);

  const stopTest = useCallback(() => {
    testWsRef.current?.send(JSON.stringify({ type: 'stop' }));
    testWsRef.current?.close();
    testWsRef.current = null;
    void testPlayerRef.current?.close();
    testPlayerRef.current = null;
  }, []);

  // ── derived ──
  const isLive = snapshot?.status === 'LIVE';
  const listenerUrl = settings?.churchSlug
    ? `${window.location.origin}/live/${settings.churchSlug}`
    : null;
  const remaining = snapshot?.remainingSeconds ?? null;
  const availableLangs = useMemo(
    () => settings?.availableTargetLanguages ?? [],
    [settings?.availableTargetLanguages]
  );
  const catalogRest = useMemo(
    () => LANGUAGE_CATALOG.filter((l) => !availableLangs.includes(l.code) && l.code !== sourceLanguage),
    [availableLangs, sourceLanguage]
  );

  if (settingsQuery.isLoading || currentQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (settings && !settings.enabled) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card>
          <CardContent className="py-10 text-center text-slate-600">
            Live Translation is not enabled for this church. Ask your administrator to enable it.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <LanguagesIcon className="h-6 w-6 text-indigo-600" />
            Live Translation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLive ? snapshot?.title : 'Let every member hear the service in their own language.'}
          </p>
        </div>
        {isLive ? (
          <span className="flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-600" />
            </span>
            LIVE
            {remaining !== null && <span className="font-mono">{formatClock(remaining)} left</span>}
          </span>
        ) : (
          <Badge variant="gray">Ready</Badge>
        )}
      </div>

      {/* Demo-mode warning. This is the failure that costs a real service:
          the mock provider echoes the pastor's own voice back and emits
          scripted captions, so everything LOOKS like it is working. It must
          be impossible to miss, and it must not be dismissable. */}
      {settings?.effectiveProvider === 'mock' && (
        <div className="rounded-lg border-2 border-amber-400 bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Demo mode — this is NOT real translation
          </p>
          <p className="mt-1 text-sm text-amber-900">
            Listeners will hear the speaker&apos;s own voice played back, and the
            transcript shows sample sentences, not what is actually being said.
            Nothing here is translated. To go live for a real service, your
            technical team must set <code className="rounded bg-amber-100 px-1">GEMINI_API_KEY</code>{' '}
            and <code className="rounded bg-amber-100 px-1">LIVE_TRANSLATION_PROVIDER=gemini</code>{' '}
            on the server and restart it.
          </p>
        </div>
      )}

      {/* time warning */}
      {isLive && warningMinutes !== null && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            The service will stop automatically in about {warningMinutes} minute{warningMinutes === 1 ? '' : 's'}.
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => extendMutation.mutate(30)} isLoading={extendMutation.isPending}>
              +30 min
            </Button>
            <Button size="sm" variant="outline" onClick={() => extendMutation.mutate(60)} isLoading={extendMutation.isPending}>
              +60 min
            </Button>
          </div>
        </div>
      )}

      {connectionNote && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          {connectionNote}
        </div>
      )}

      {/* ended summary */}
      {!isLive && summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This service</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-slate-500">Duration</dt>
                <dd className="text-lg font-semibold text-slate-900">{formatClock(summary.durationSeconds)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Languages</dt>
                <dd className="text-lg font-semibold text-slate-900">{summary.languagesUsed.length}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Peak listeners</dt>
                <dd className="text-lg font-semibold text-slate-900">{summary.peakListeners}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Translation minutes</dt>
                <dd className="text-lg font-semibold text-slate-900">{Math.round(summary.translationSeconds / 60)}</dd>
              </div>
            </dl>
            {summary.perLanguage.length > 0 && (
              <p className="mt-3 text-xs text-slate-500">
                {summary.perLanguage
                  .map((l) => `${displayName(l.targetLanguage)}: ${Math.round(l.activeSeconds / 60)} min`)
                  .join(' · ')}
              </p>
            )}

            {/* The next thing a church actually wants after the service is
                the notes. Without this the operator has to know to go to
                Past services and find the service again by its timestamp. */}
            <Link
              to={`/live-translation/history?session=${summary.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
            >
              <BookOpen className="h-4 w-4" />
              Write the sermon notes for this service
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* audio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mic className="h-4 w-4 text-indigo-600" />
                Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                label="Audio source"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                options={devices.map((d) => ({ label: d.label, value: d.deviceId }))}
                placeholder={devices.length === 0 ? 'No audio inputs found' : undefined}
                helpText="Recommended: a clean Pastor/microphone feed from your mixer or OBS. Fallback: this computer's microphone."
              />
              {deviceError ? (
                <p className="text-sm text-rose-600">{deviceError}</p>
              ) : (
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>Input level</span>
                    <span className={cn('font-medium', level > 0.02 ? 'text-emerald-600' : 'text-slate-400')}>
                      {level > 0.02 ? '✓ Audio detected' : 'Waiting for sound…'}
                    </span>
                  </div>
                  <div className="flex h-3 gap-0.5 overflow-hidden rounded bg-slate-100">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-full flex-1 rounded-sm transition-colors duration-75',
                          level * 24 * 2.2 > i
                            ? i > 19
                              ? 'bg-rose-500'
                              : i > 15
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                            : 'bg-slate-200'
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
              {!isLive && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Headphones className="h-3.5 w-3.5" />}
                  disabled={!!deviceError || selectedLangs.length === 0}
                  onClick={() => {
                    setTestLang(selectedLangs[0] ?? '');
                    setTestState('idle');
                    setTestCaptions([]);
                    setTestOpen(true);
                  }}
                >
                  Test translation
                </Button>
              )}
            </CardContent>
          </Card>

          {/* setup OR live view */}
          {!isLive ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input label="Service name" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Select
                      label="Pastor speaks"
                      value={sourceLanguage}
                      onChange={(e) => setSourceLanguage(e.target.value)}
                      options={LANGUAGE_CATALOG.map((l) => ({ label: displayName(l.code), value: l.code }))}
                    />
                    <Select
                      label="Stop automatically after"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      options={DURATION_OPTIONS}
                      helpText="You can extend during the service. This protects against forgotten sessions."
                    />
                  </div>
                  <label className="flex items-start gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={allowCodeSwitching}
                      onChange={(e) => setAllowCodeSwitching(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      Pastor sometimes switches languages mid-message
                      <span className="block text-xs text-slate-500">
                        Keeps translating smoothly through short switches (e.g. English ↔ Igbo).
                      </span>
                    </span>
                  </label>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Translation languages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {availableLangs.map((code) => {
                      const selected = selectedLangs.includes(code);
                      const lang = languageByCode(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() =>
                            setSelectedLangs((prev) =>
                              selected ? prev.filter((c) => c !== code) : [...prev, code]
                            )
                          }
                          className={cn(
                            'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                            selected
                              ? 'border-indigo-600 bg-indigo-50 font-medium text-indigo-700'
                              : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                          )}
                          aria-pressed={selected}
                        >
                          <span aria-hidden>{lang.flag}</span>
                          {displayName(code)}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setAddLangOpen(true)}
                      className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add language
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    A language only uses translation time while someone is actually listening to it.
                  </p>
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="w-full py-4 text-lg"
                leftIcon={<Radio className="h-5 w-5" />}
                disabled={selectedLangs.length === 0 || !!deviceError}
                isLoading={startMutation.isPending}
                onClick={() => setConfirmStartOpen(true)}
              >
                START LIVE TRANSLATION
              </Button>
            </>
          ) : (
            <>
              {/* live languages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4 text-indigo-600" />
                    Live languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-slate-100">
                    {snapshot?.streams.map((stream) => {
                      const lang = languageByCode(stream.targetLanguage);
                      const statusUi =
                        stream.status === 'LIVE'
                          ? { label: 'Live', variant: 'success' as const }
                          : stream.status === 'RECONNECTING' || stream.status === 'STARTING'
                            ? { label: 'Connecting…', variant: 'warning' as const }
                            : stream.status === 'ERROR'
                              ? { label: 'Unavailable', variant: 'danger' as const }
                              : { label: 'Waiting for listeners', variant: 'gray' as const };
                      return (
                        <li key={stream.targetLanguage} className="flex items-center justify-between py-2.5">
                          <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                            <span aria-hidden>{lang.flag}</span>
                            {displayName(stream.targetLanguage)}
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">
                              {stream.listeners} listening
                            </span>
                            <Badge variant={statusUi.variant} dot>
                              {statusUi.label}
                            </Badge>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>

              {/* transcript */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Live transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    {transcript.length === 0 ? (
                      <p className="text-slate-400">Waiting for the message to begin…</p>
                    ) : (
                      transcript.map((line, i) => <p key={i}>{line}</p>)
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* live controls */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={snapshot?.translationPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  onClick={() => pauseMutation.mutate(!snapshot?.translationPaused)}
                  isLoading={pauseMutation.isPending}
                >
                  {snapshot?.translationPaused ? 'Resume translation' : 'Pause (worship)'}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => extendMutation.mutate(30)}>
                    +30 min
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => extendMutation.mutate(60)}>
                    +60 min
                  </Button>
                </div>
                <Button
                  variant="danger"
                  size="lg"
                  leftIcon={<Square className="h-4 w-4" />}
                  onClick={() => setConfirmEndOpen(true)}
                >
                  END TRANSLATION
                </Button>
              </div>
            </>
          )}
        </div>

        {/* side column */}
        <div className="space-y-6">
          {listenerUrl && <QrCard url={listenerUrl} />}

          {/* health — plain words only (spec §36) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Health</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <HealthRow
                  label="Audio"
                  value={
                    deviceError
                      ? 'Check device'
                      : isLive
                        ? snapshot?.health.audio === 'excellent'
                          ? 'Excellent'
                          : snapshot?.health.audio === 'quiet'
                            ? 'Quiet'
                            : 'No sound'
                        : level > 0.02
                          ? 'Excellent'
                          : 'Waiting'
                  }
                  good={!deviceError && (isLive ? snapshot?.health.audio === 'excellent' : level > 0.02)}
                />
                <HealthRow
                  label="Translation"
                  value={
                    !isLive
                      ? 'Not started'
                      : snapshot?.translationPaused
                        ? 'Paused'
                        : snapshot?.health.ai === 'connected'
                          ? 'Connected'
                          : snapshot?.health.ai === 'partial'
                            ? 'Partly connected'
                            : snapshot?.health.ai === 'down'
                              ? 'Reconnecting'
                              : 'Waiting for listeners'
                  }
                  good={isLive && !snapshot?.translationPaused && snapshot?.health.ai === 'connected'}
                />
                <HealthRow label="Listeners" value={String(snapshot?.totalListeners ?? 0)} good={(snapshot?.totalListeners ?? 0) > 0} />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* start confirmation (spec §10) */}
      <ConfirmDialog
        isOpen={confirmStartOpen}
        onClose={() => setConfirmStartOpen(false)}
        onConfirm={() => {
          setConfirmStartOpen(false);
          startMutation.mutate();
        }}
        title="Ready to go live?"
        message={[
          `Audio: ${devices.find((d) => d.deviceId === deviceId)?.label ?? 'selected device'}`,
          `Pastor: ${displayName(sourceLanguage)}`,
          `Languages: ${selectedLangs.map((c) => languageByCode(c).englishName).join(', ')}`,
          `Stops automatically after ${DURATION_OPTIONS.find((d) => d.value === durationMinutes)?.label ?? durationMinutes + ' min'}.`,
        ].join('\n')}
        confirmText="Start Translation"
        cancelText="Cancel"
        variant="info"
      />

      {/* end confirmation (spec §12) */}
      <ConfirmDialog
        isOpen={confirmEndOpen}
        onClose={() => setConfirmEndOpen(false)}
        onConfirm={() => {
          setConfirmEndOpen(false);
          endMutation.mutate();
        }}
        title="End Live Translation for everyone?"
        message="Every listener will hear the service has ended, and all translation stops immediately."
        confirmText="End Service"
        cancelText="Keep Live"
        variant="danger"
      />

      {/* add language to church settings */}
      <Modal isOpen={addLangOpen} onClose={() => setAddLangOpen(false)} title="Add a language" size="md">
        <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {catalogRest.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-indigo-400 hover:bg-indigo-50"
              onClick={() => {
                addLanguageToSettings.mutate(lang.code);
                setSelectedLangs((prev) => [...prev, lang.code]);
                setAddLangOpen(false);
              }}
            >
              <span aria-hidden>{lang.flag}</span>
              {displayName(lang.code)}
            </button>
          ))}
        </div>
      </Modal>

      {/* pre-service translation test (spec §33) */}
      <Modal
        isOpen={testOpen}
        onClose={() => {
          stopTest();
          setTestOpen(false);
        }}
        title="Test translation"
        size="md"
      >
        <div className="space-y-4">
          {settings?.effectiveProvider !== 'mock' && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              A real translation request runs during the test (it may use quota). It stops by itself
              after 45 seconds.
            </p>
          )}
          <Select
            label="Test language"
            value={testLang}
            onChange={(e) => setTestLang(e.target.value)}
            options={selectedLangs.map((c) => ({ label: displayName(c), value: c }))}
            disabled={testState === 'running'}
          />
          {testState === 'running' && (
            <p className="text-sm text-emerald-700">
              Speak into the selected audio source — you should hear the translation on this computer
              in a few seconds.
            </p>
          )}
          <div className="min-h-16 space-y-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            {testCaptions.length === 0 ? (
              <p className="text-slate-400">Captions will appear here…</p>
            ) : (
              testCaptions.map((line, i) => <p key={i}>{line}</p>)
            )}
          </div>
          <div className="flex justify-end gap-2">
            {testState === 'running' ? (
              <Button variant="secondary" onClick={stopTest}>
                Stop test
              </Button>
            ) : (
              <Button onClick={() => void startTest()} disabled={!testLang}>
                Start 45-second test
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function HealthRow({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn('font-medium', good ? 'text-emerald-600' : 'text-slate-700')}>{value}</dd>
    </div>
  );
}
