/**
 * Church-level Live Translation configuration.
 *
 * Everything here existed only as an API call until now, which meant the
 * church vocabulary — the single biggest lever on translation accuracy for a
 * church, since "Rhapsody of Realities" and a pastor's name are exactly what
 * a general model mangles — could not be set by the people who know it.
 *
 * Written for an administrator, not an engineer: no provider names, no
 * sample rates, and every control says what it changes for the congregation.
 */
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Languages as LanguagesIcon, Plus, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { liveTranslationApi, type InterpreterVoice } from '../api/liveTranslation.api';
import { LANGUAGE_CATALOG, displayName } from '../lib/languages';

const VOICE_OPTIONS: Array<{ label: string; value: InterpreterVoice }> = [
  { label: 'Male — warm', value: 'warm_male' },
  { label: 'Female — warm', value: 'warm_female' },
  { label: 'Male — neutral', value: 'neutral_male' },
  { label: 'Female — neutral', value: 'neutral_female' },
];

const DURATION_OPTIONS = [
  { label: '1 hour', value: '60' },
  { label: '1.5 hours', value: '90' },
  { label: '2 hours', value: '120' },
  { label: '3 hours', value: '180' },
];

export function LiveTranslationSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['live-translation', 'settings'],
    queryFn: () => liveTranslationApi.getSettings().then((r) => r.data),
  });

  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [languages, setLanguages] = useState<string[]>([]);
  const [voice, setVoice] = useState<InterpreterVoice>('warm_male');
  const [defaultMinutes, setDefaultMinutes] = useState('120');
  const [idleMinutes, setIdleMinutes] = useState('5');
  const [saveTranscript, setSaveTranscript] = useState(true);
  const [allowPublic, setAllowPublic] = useState(true);
  const [glossary, setGlossary] = useState<string[]>([]);
  const [glossaryDraft, setGlossaryDraft] = useState('');

  // Hydrate once the server state lands; afterwards the form owns its values.
  useEffect(() => {
    const s = settingsQuery.data;
    if (!s) return;
    setSourceLanguage(s.sourceLanguage);
    setLanguages(s.availableTargetLanguages);
    setVoice(s.interpreterVoice);
    setDefaultMinutes(String(s.defaultSessionMinutes));
    setIdleMinutes(String(s.idleLanguageTimeoutMinutes));
    setSaveTranscript(s.saveTranscript);
    setAllowPublic(s.allowPublicListeners);
    setGlossary(s.glossary);
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      liveTranslationApi.updateSettings({
        sourceLanguage,
        availableTargetLanguages: languages,
        interpreterVoice: voice,
        defaultSessionMinutes: Number(defaultMinutes),
        idleLanguageTimeoutMinutes: Number(idleMinutes),
        saveTranscript,
        allowPublicListeners: allowPublic,
        glossary,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['live-translation', 'settings'] });
      toast({ title: 'Settings saved', variant: 'success' });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast({ title: err.response?.data?.message ?? 'Could not save settings', variant: 'error' }),
  });

  const addGlossaryTerm = () => {
    const term = glossaryDraft.trim();
    if (!term || glossary.includes(term)) return;
    setGlossary((prev) => [...prev, term]);
    setGlossaryDraft('');
  };

  if (settingsQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  const settings = settingsQuery.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <LanguagesIcon className="h-6 w-6 text-indigo-600" />
          Live Translation settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          How live translation behaves for {settings?.churchName || 'your church'}.
        </p>
      </div>

      {settings?.effectiveProvider === 'mock' && (
        <div className="rounded-lg border-2 border-amber-400 bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Demo mode is active
          </p>
          <p className="mt-1 text-sm text-amber-900">
            Nothing is really translated: listeners hear the speaker&apos;s own voice. Your technical
            team needs to configure the translation service on the server.
          </p>
        </div>
      )}

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Language the message is preached in"
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            options={LANGUAGE_CATALOG.map((l) => ({ label: displayName(l.code), value: l.code }))}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Languages you offer</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_CATALOG.filter((l) => l.code !== sourceLanguage).map((lang) => {
                const on = languages.includes(lang.code);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setLanguages((prev) =>
                        on ? prev.filter((c) => c !== lang.code) : [...prev, lang.code]
                      )
                    }
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                      on
                        ? 'border-indigo-600 bg-indigo-50 font-medium text-indigo-700'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span aria-hidden>{lang.flag}</span>
                    {displayName(lang.code)}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Offering a language costs nothing until someone actually listens to it.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Church vocabulary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Church vocabulary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Names and terms your church uses that a translator would otherwise get wrong — ministry
            names, your pastor&apos;s name, publications, and words like Rhema or Zoe. This is the
            single biggest thing you can do to improve accuracy.
          </p>
          <div className="flex gap-2">
            <Input
              value={glossaryDraft}
              onChange={(e) => setGlossaryDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addGlossaryTerm();
                }
              }}
              placeholder="e.g. Rhapsody of Realities"
              className="flex-1"
            />
            <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={addGlossaryTerm}>
              Add
            </Button>
          </div>
          {glossary.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {glossary.map((term) => (
                <span
                  key={term}
                  className="flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-sm text-slate-700"
                >
                  {term}
                  <button
                    type="button"
                    aria-label={`Remove ${term}`}
                    onClick={() => setGlossary((prev) => prev.filter((x) => x !== term))}
                    className="rounded-full p-0.5 hover:bg-slate-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Behaviour */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">During a service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Interpreter voice"
              value={voice}
              onChange={(e) => setVoice(e.target.value as InterpreterVoice)}
              options={VOICE_OPTIONS}
            />
            <Select
              label="Stop automatically after"
              value={defaultMinutes}
              onChange={(e) => setDefaultMinutes(e.target.value)}
              options={DURATION_OPTIONS}
              helpText="Operators can extend during the service."
            />
          </div>
          <Select
            label="Stop an unused language after"
            value={idleMinutes}
            onChange={(e) => setIdleMinutes(e.target.value)}
            options={[
              { label: '2 minutes', value: '2' },
              { label: '5 minutes', value: '5' },
              { label: '10 minutes', value: '10' },
            ]}
            helpText="When nobody is listening to a language, it pauses and restarts if someone returns."
          />

          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={saveTranscript}
              onChange={(e) => setSaveTranscript(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              Save the sermon transcript
              <span className="block text-xs text-slate-500">
                Keeps a written record of what was preached, readable afterwards under Past services.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={allowPublic}
              onChange={(e) => setAllowPublic(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              Anyone with the link can listen
              <span className="block text-xs text-slate-500">
                Switch off to require members to sign in — visitors scanning the QR would then be
                turned away, so most churches leave this on.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          leftIcon={<Save className="h-4 w-4" />}
          isLoading={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          Save settings
        </Button>
      </div>
    </div>
  );
}
