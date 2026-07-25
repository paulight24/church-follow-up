import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { settingsApi, type AllSettings } from '../api/settings.api';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll().then((res) => res.data),
  });

  const [churchName, setChurchName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  const [cycleDuration, setCycleDuration] = useState('14');
  const [autoEscalation, setAutoEscalation] = useState('5');
  const [maxAttempts, setMaxAttempts] = useState('5');

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  useEffect(() => {
    if (!data) return;
    const profile = data.CHURCH_PROFILE ?? {};
    setChurchName(asString(profile.churchName));
    setAddress(asString(profile.address));
    setPhone(asString(profile.phone));
    setEmail(asString(profile.email));
    setWebsite(asString(profile.website));

    const followUp = data.FOLLOW_UP ?? {};
    setCycleDuration(asString(followUp.cycleDuration, '14'));
    setAutoEscalation(asString(followUp.autoEscalationDays, '5'));
    setMaxAttempts(asString(followUp.maxAttempts, '5'));

    const notifications = data.NOTIFICATIONS ?? {};
    setEmailNotifs(asBoolean(notifications.email, true));
    setSmsNotifs(asBoolean(notifications.sms, true));
    setInAppNotifs(asBoolean(notifications.inApp, true));
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        settingsApi.updateCategory('CHURCH_PROFILE', { churchName, address, phone, email, website }),
        settingsApi.updateCategory('FOLLOW_UP', {
          cycleDuration,
          autoEscalationDays: autoEscalation,
          maxAttempts,
        }),
        settingsApi.updateCategory('NOTIFICATIONS', {
          email: emailNotifs,
          sms: smsNotifs,
          inApp: inAppNotifs,
        }),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your church and system preferences"
      />

      {saveMutation.isSuccess && (
        <Alert variant="success">Settings saved successfully.</Alert>
      )}
      {saveMutation.isError && (
        <Alert variant="error">Failed to save settings. Please try again.</Alert>
      )}

      {/* Church Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Church Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input
                label="Church Name"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="Enter church address"
              />
            </div>
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@church.org"
            />
            <div className="md:col-span-2">
              <Input
                label="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.church.org"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Follow-Up Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-Up Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select
              label="Default Cycle Duration"
              value={cycleDuration}
              onChange={(e) => setCycleDuration(e.target.value)}
              options={[
                { label: '7 days', value: '7' },
                { label: '14 days', value: '14' },
                { label: '30 days', value: '30' },
              ]}
            />
            <Select
              label="Auto-Escalation After"
              value={autoEscalation}
              onChange={(e) => setAutoEscalation(e.target.value)}
              options={[
                { label: '3 days', value: '3' },
                { label: '5 days', value: '5' },
                { label: '7 days', value: '7' },
              ]}
            />
            <Input
              label="Max Follow-Up Attempts"
              type="number"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              min={1}
              max={20}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">Email notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={smsNotifs}
                onChange={(e) => setSmsNotifs(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">SMS notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={inAppNotifs}
                onChange={(e) => setInAppNotifs(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">In-app notifications</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-500">
            SMS and email delivery currently run through stub providers (they log outbound
            messages instead of sending them). Configure real credentials via environment
            variables on the server (SMS_PROVIDER, TWILIO_*, EMAIL_PROVIDER, RESEND_API_KEY,
            etc.) — there is no in-app credentials UI yet.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-1 font-medium text-slate-900">SMS Provider</h4>
              <p className="mb-3 text-sm text-slate-500">
                Console stub active. Set SMS_PROVIDER=twilio + credentials on the server to go live.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-1 font-medium text-slate-900">WhatsApp Business</h4>
              <p className="mb-3 text-sm text-slate-500">
                Not yet implemented.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-1 font-medium text-slate-900">Email Service</h4>
              <p className="mb-3 text-sm text-slate-500">
                Configure EMAIL_PROVIDER + RESEND_API_KEY/SENDGRID_API_KEY on the server.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
