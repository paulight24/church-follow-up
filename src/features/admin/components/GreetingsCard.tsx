import { useState } from 'react';
import { Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import api from '@/config/api';

/**
 * Automatic greeting settings for one milestone (birthday, anniversary).
 * Both milestones share this card because they are the same gesture with a
 * different date column — see backend jobs/milestoneGreetings.ts.
 */
export interface GreetingValues {
  enabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  smsTemplate: string;
  emailSubject: string;
  emailTemplate: string;
}

interface GreetingsCardProps {
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  description: string;
  /** e.g. '/settings/birthday/test' — runs the real sweep for today. */
  testEndpoint: string;
  testHint: string;
  smsPlaceholder: string;
  values: GreetingValues;
  onChange: (patch: Partial<GreetingValues>) => void;
}

export function GreetingsCard({
  title,
  icon: Icon,
  iconClassName,
  description,
  testEndpoint,
  testHint,
  smsPlaceholder,
  values,
  onChange,
}: GreetingsCardProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post(testEndpoint);
      setTestResult({ type: 'success', message: res.data.message });
    } catch {
      setTestResult({ type: 'error', message: 'Could not run the job. Check server logs.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconClassName}`} />
            {title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Enable automatic messages</p>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={values.enabled}
              aria-label={`Enable ${title}`}
              onClick={() => onChange({ enabled: !values.enabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${values.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${values.enabled ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {values.enabled && (
            <>
              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">Channels</p>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={values.smsEnabled}
                    onChange={(e) => onChange({ smsEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">SMS (requires Twilio configured)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={values.emailEnabled}
                    onChange={(e) => onChange({ emailEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Email (requires email provider configured)</span>
                </label>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Available placeholders</p>
                  <p className="mt-1 font-mono text-xs text-slate-600">
                    {'{{firstName}} {{lastName}} {{preferredName}} {{name}} {{churchName}}'}
                  </p>
                </div>

                <Textarea
                  label="SMS Template"
                  value={values.smsTemplate}
                  onChange={(e) => onChange({ smsTemplate: e.target.value })}
                  rows={3}
                  placeholder={smsPlaceholder}
                />

                <Input
                  label="Email Subject"
                  value={values.emailSubject}
                  onChange={(e) => onChange({ emailSubject: e.target.value })}
                  placeholder={smsPlaceholder}
                />

                <div>
                  <Textarea
                    label="Email Body"
                    value={values.emailTemplate}
                    onChange={(e) => onChange({ emailTemplate: e.target.value })}
                    rows={5}
                    placeholder="<p>Your message…</p>"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Just the message — your church header, greeting headline and footer are added
                    automatically. See it in <strong>Email Design &amp; Previews</strong> above.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Send className="h-4 w-4" />}
                  onClick={runTest}
                  isLoading={testing}
                >
                  Run now
                </Button>
                <span className="text-xs text-slate-500">{testHint}</span>
              </div>
              {testResult && (
                <Alert variant={testResult.type === 'success' ? 'success' : 'error'}>{testResult.message}</Alert>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
