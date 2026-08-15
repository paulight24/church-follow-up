import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Cake, Gem } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { settingsApi, type AllSettings } from '../api/settings.api';
import { WhatsAppSettingsPanel } from '@/features/whatsapp/components/WhatsAppSettingsPanel';
import { DataExportCard } from '../components/DataExportCard';
import { IntegrationsCard } from '../components/IntegrationsCard';
import { EmailPreviewCard } from '../components/EmailPreviewCard';
import { GreetingsCard } from '../components/GreetingsCard';

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

  // Greeting defaults are church-neutral — {{churchName}} is substituted per
  // church at send time, and the branded email shell supplies the headline,
  // so the body template carries no heading of its own.
  const [birthdayEnabled, setBirthdayEnabled] = useState(false);
  const [birthdaySmsEnabled, setBirthdaySmsEnabled] = useState(true);
  const [birthdayEmailEnabled, setBirthdayEmailEnabled] = useState(true);
  const [birthdaySmsTemplate, setBirthdaySmsTemplate] = useState(
    "Happy Birthday {{firstName}}! 🎂 Wishing you a wonderful day filled with God's blessings. With love from {{churchName}}."
  );
  const [birthdayEmailSubject, setBirthdayEmailSubject] = useState(
    'Happy Birthday {{firstName}}! 🎂'
  );
  const [birthdayEmailTemplate, setBirthdayEmailTemplate] = useState(
    '<p>On this special day, we celebrate you and thank God for your life. May this new year of your life be filled with His grace, favour and endless blessings.</p><p>With love,<br/>{{churchName}}</p>'
  );

  const [anniversaryEnabled, setAnniversaryEnabled] = useState(false);
  const [anniversarySmsEnabled, setAnniversarySmsEnabled] = useState(true);
  const [anniversaryEmailEnabled, setAnniversaryEmailEnabled] = useState(true);
  const [anniversarySmsTemplate, setAnniversarySmsTemplate] = useState(
    'Happy Anniversary {{firstName}}! 💍 Celebrating the covenant God established in your marriage. With love from {{churchName}}.'
  );
  const [anniversaryEmailSubject, setAnniversaryEmailSubject] = useState(
    'Happy Anniversary, {{firstName}}! 💍'
  );
  const [anniversaryEmailTemplate, setAnniversaryEmailTemplate] = useState(
    '<p>Today we celebrate the covenant God established in your marriage. May your love keep growing, and may your home remain filled with His peace and joy.</p><p>With love,<br/>{{churchName}}</p>'
  );

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

    setBirthdayEnabled(asBoolean(notifications.birthday_enabled, false));
    setBirthdaySmsEnabled(asBoolean(notifications.birthday_sms_enabled, true));
    setBirthdayEmailEnabled(asBoolean(notifications.birthday_email_enabled, true));
    if (notifications.birthday_sms_template) setBirthdaySmsTemplate(asString(notifications.birthday_sms_template));
    if (notifications.birthday_email_subject) setBirthdayEmailSubject(asString(notifications.birthday_email_subject));
    if (notifications.birthday_email_template) setBirthdayEmailTemplate(asString(notifications.birthday_email_template));

    setAnniversaryEnabled(asBoolean(notifications.anniversary_enabled, false));
    setAnniversarySmsEnabled(asBoolean(notifications.anniversary_sms_enabled, true));
    setAnniversaryEmailEnabled(asBoolean(notifications.anniversary_email_enabled, true));
    if (notifications.anniversary_sms_template) setAnniversarySmsTemplate(asString(notifications.anniversary_sms_template));
    if (notifications.anniversary_email_subject) setAnniversaryEmailSubject(asString(notifications.anniversary_email_subject));
    if (notifications.anniversary_email_template) setAnniversaryEmailTemplate(asString(notifications.anniversary_email_template));
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
          birthday_enabled: birthdayEnabled,
          birthday_sms_enabled: birthdaySmsEnabled,
          birthday_email_enabled: birthdayEmailEnabled,
          birthday_sms_template: birthdaySmsTemplate,
          birthday_email_subject: birthdayEmailSubject,
          birthday_email_template: birthdayEmailTemplate,
          anniversary_enabled: anniversaryEnabled,
          anniversary_sms_enabled: anniversarySmsEnabled,
          anniversary_email_enabled: anniversaryEmailEnabled,
          anniversary_sms_template: anniversarySmsTemplate,
          anniversary_email_subject: anniversaryEmailSubject,
          anniversary_email_template: anniversaryEmailTemplate,
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

      {/* Data ownership: full export (always available) + plan */}
      <DataExportCard />

      {/* Per-church sender accounts (Twilio / Resend / SendGrid / Meta) */}
      <IntegrationsCard />

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
              placeholder="+1 (555) 123-4567"
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

      {/* What every email looks like, rendered from this church's branding */}
      <EmailPreviewCard />

      {/* Birthday Greetings */}
      <GreetingsCard
        title="Birthday Greetings"
        icon={Cake}
        iconClassName="text-pink-500"
        description="Sends personalised greetings to members on their birthday at 8:00 AM daily"
        testEndpoint="/settings/birthday/test"
        testHint="Sends to every member whose birthday is today. Save settings first."
        smsPlaceholder="Happy Birthday {{firstName}}!"
        values={{
          enabled: birthdayEnabled,
          smsEnabled: birthdaySmsEnabled,
          emailEnabled: birthdayEmailEnabled,
          smsTemplate: birthdaySmsTemplate,
          emailSubject: birthdayEmailSubject,
          emailTemplate: birthdayEmailTemplate,
        }}
        onChange={(patch) => {
          if (patch.enabled !== undefined) setBirthdayEnabled(patch.enabled);
          if (patch.smsEnabled !== undefined) setBirthdaySmsEnabled(patch.smsEnabled);
          if (patch.emailEnabled !== undefined) setBirthdayEmailEnabled(patch.emailEnabled);
          if (patch.smsTemplate !== undefined) setBirthdaySmsTemplate(patch.smsTemplate);
          if (patch.emailSubject !== undefined) setBirthdayEmailSubject(patch.emailSubject);
          if (patch.emailTemplate !== undefined) setBirthdayEmailTemplate(patch.emailTemplate);
        }}
      />

      {/* Wedding Anniversary Greetings */}
      <GreetingsCard
        title="Anniversary Greetings"
        icon={Gem}
        iconClassName="text-rose-500"
        description="Sends greetings to members on their wedding anniversary at 8:00 AM daily"
        testEndpoint="/settings/anniversary/test"
        testHint="Sends to every member whose anniversary is today. Save settings first."
        smsPlaceholder="Happy Anniversary {{firstName}}!"
        values={{
          enabled: anniversaryEnabled,
          smsEnabled: anniversarySmsEnabled,
          emailEnabled: anniversaryEmailEnabled,
          smsTemplate: anniversarySmsTemplate,
          emailSubject: anniversaryEmailSubject,
          emailTemplate: anniversaryEmailTemplate,
        }}
        onChange={(patch) => {
          if (patch.enabled !== undefined) setAnniversaryEnabled(patch.enabled);
          if (patch.smsEnabled !== undefined) setAnniversarySmsEnabled(patch.smsEnabled);
          if (patch.emailEnabled !== undefined) setAnniversaryEmailEnabled(patch.emailEnabled);
          if (patch.smsTemplate !== undefined) setAnniversarySmsTemplate(patch.smsTemplate);
          if (patch.emailSubject !== undefined) setAnniversaryEmailSubject(patch.emailSubject);
          if (patch.emailTemplate !== undefined) setAnniversaryEmailTemplate(patch.emailTemplate);
        }}
      />

      {/* WhatsApp templates (synced from Meta) */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-500">
            Credentials live in <strong>Messaging Accounts</strong> above. Templates are authored and
            approved in Meta Business Manager, then synced here.
          </p>
          <WhatsAppSettingsPanel />
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
