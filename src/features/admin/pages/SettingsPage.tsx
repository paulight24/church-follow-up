// NOTE: The backend has no settings / system-config module yet (no GET/PATCH
// /settings or similar endpoint exists in church-follow-up-api). This page is
// intentionally left on local component state with no backing API call — the
// form does not persist anything server-side. Do not wire this up to a fake
// endpoint; revisit once the backend exposes a settings module.
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export function SettingsPage() {
  const [churchName, setChurchName] = useState('Grace Community Church');
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your church and system preferences"
      />

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-1 font-medium text-slate-900">SMS Provider</h4>
              <p className="mb-3 text-sm text-slate-500">
                Connect your SMS gateway for text messaging
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('SMS provider configuration coming soon')}
              >
                Configure
              </Button>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-1 font-medium text-slate-900">WhatsApp Business</h4>
              <p className="mb-3 text-sm text-slate-500">
                Integrate WhatsApp for member communication
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('WhatsApp configuration coming soon')}
              >
                Configure
              </Button>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-1 font-medium text-slate-900">Email Service</h4>
              <p className="mb-3 text-sm text-slate-500">
                Set up email delivery for campaigns and notifications
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Email service configuration coming soon')}
              >
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={() => alert('Settings saved (mock)')}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
