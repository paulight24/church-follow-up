import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareText, Send, Phone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { settingsApi } from '../api/settings.api';
import { MessagingStatusPanel } from './MessagingStatusPanel';

/**
 * Per-church sender accounts. Everything here is optional: a church that
 * configures nothing sends through the platform's shared accounts. Secrets
 * are write-only — the server returns a mask ('••••••••') for stored keys
 * and leaves them unchanged when the mask is submitted back.
 */
interface IntegrationValues {
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_from_number: string;
  email_provider: string;
  resend_api_key: string;
  sendgrid_api_key: string;
  email_from: string;
  whatsapp_phone_number_id: string;
  whatsapp_access_token: string;
  whatsapp_business_account_id: string;
}

const EMPTY: IntegrationValues = {
  twilio_account_sid: '',
  twilio_auth_token: '',
  twilio_from_number: '',
  email_provider: '',
  resend_api_key: '',
  sendgrid_api_key: '',
  email_from: '',
  whatsapp_phone_number_id: '',
  whatsapp_access_token: '',
  whatsapp_business_account_id: '',
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function IntegrationsCard() {
  const queryClient = useQueryClient();
  const { data: allSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll().then((res) => res.data),
  });
  const data = allSettings?.INTEGRATIONS;

  const [values, setValues] = useState<IntegrationValues>(EMPTY);

  useEffect(() => {
    if (!data) return;
    setValues({
      twilio_account_sid: asString(data.twilio_account_sid),
      twilio_auth_token: asString(data.twilio_auth_token),
      twilio_from_number: asString(data.twilio_from_number),
      email_provider: asString(data.email_provider),
      resend_api_key: asString(data.resend_api_key),
      sendgrid_api_key: asString(data.sendgrid_api_key),
      email_from: asString(data.email_from),
      whatsapp_phone_number_id: asString(data.whatsapp_phone_number_id),
      whatsapp_access_token: asString(data.whatsapp_access_token),
      whatsapp_business_account_id: asString(data.whatsapp_business_account_id),
    });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload: IntegrationValues) =>
      settingsApi.updateCategory('INTEGRATIONS', payload as unknown as Record<string, unknown>),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const set = (key: keyof IntegrationValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messaging Accounts (Your Church's Own)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Whether each channel can actually deliver right now, and a real
            test send — the loop you watch while pasting credentials in. */}
        <MessagingStatusPanel />

        <p className="mb-6 text-sm text-slate-500">
          Optional. Leave anything blank to send through the platform's shared accounts.
          Add your church's own Twilio / email / WhatsApp credentials to send from your own
          numbers and addresses — keys are stored encrypted and never shown again after saving.
        </p>

        {saveMutation.isSuccess && <Alert variant="success" className="mb-4">Messaging accounts saved.</Alert>}
        {saveMutation.isError && <Alert variant="error" className="mb-4">Could not save. Please try again.</Alert>}

        <div className="space-y-8">
          {/* SMS */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Phone className="h-4 w-4 text-indigo-500" />
              SMS — Twilio
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Account SID"
                placeholder="AC…"
                value={values.twilio_account_sid}
                onChange={set('twilio_account_sid')}
              />
              <Input
                label="Auth Token"
                type="password"
                placeholder={values.twilio_auth_token ? 'saved — enter to replace' : 'from Twilio console'}
                value={values.twilio_auth_token}
                onChange={set('twilio_auth_token')}
              />
              <Input
                label="From number"
                placeholder="+15551234567"
                value={values.twilio_from_number}
                onChange={set('twilio_from_number')}
              />
            </div>
          </section>

          {/* Email */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Send className="h-4 w-4 text-indigo-500" />
              Email — Resend or SendGrid
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Provider"
                value={values.email_provider}
                onChange={set('email_provider')}
                options={[
                  { value: '', label: 'Platform default' },
                  { value: 'resend', label: 'Resend (your account)' },
                  { value: 'sendgrid', label: 'SendGrid (your account)' },
                ]}
              />
              <Input
                label="From address"
                type="email"
                placeholder="hello@yourchurch.org"
                value={values.email_from}
                onChange={set('email_from')}
              />
              {values.email_provider === 'resend' && (
                <Input
                  label="Resend API key"
                  type="password"
                  placeholder={values.resend_api_key ? 'saved — enter to replace' : 're_…'}
                  value={values.resend_api_key}
                  onChange={set('resend_api_key')}
                />
              )}
              {values.email_provider === 'sendgrid' && (
                <Input
                  label="SendGrid API key"
                  type="password"
                  placeholder={values.sendgrid_api_key ? 'saved — enter to replace' : 'SG.…'}
                  value={values.sendgrid_api_key}
                  onChange={set('sendgrid_api_key')}
                />
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              The from-address domain must be verified in your Resend/SendGrid account or providers will reject sends.
            </p>
          </section>

          {/* WhatsApp */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MessageSquareText className="h-4 w-4 text-indigo-500" />
              WhatsApp — Meta Cloud API
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Phone Number ID"
                placeholder="from Meta API Setup"
                value={values.whatsapp_phone_number_id}
                onChange={set('whatsapp_phone_number_id')}
              />
              <Input
                label="Access token"
                type="password"
                placeholder={values.whatsapp_access_token ? 'saved — enter to replace' : 'permanent system-user token'}
                value={values.whatsapp_access_token}
                onChange={set('whatsapp_access_token')}
              />
              <Input
                label="Business Account ID"
                placeholder="WABA id (for template sync)"
                value={values.whatsapp_business_account_id}
                onChange={set('whatsapp_business_account_id')}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              From Meta Business Manager → WhatsApp → API Setup. Use a permanent System User token, not the 24-hour test token.
            </p>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => saveMutation.mutate(values)} isLoading={saveMutation.isPending}>
            Save messaging accounts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
