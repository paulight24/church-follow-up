/**
 * The one thing this page asks for — and it asks after the books, not before.
 *
 * The resources above are ungated on purpose. This card is the other half of
 * that decision: a visitor who wants to be found says so, and what arrives is
 * a person who asked to hear from the church rather than a name somebody
 * typed to get past a download gate. It is collapsed until tapped so it never
 * reads as a toll on the way to the material.
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { CheckCircle2, HeartHandshake, Send } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { ApiError } from '@/types';
import { useTranslation } from '@/i18n';
import { RESOURCE_INTERESTS, type ResourceInterest } from '@/types/resource';
import { publicResourcesApi } from '../api/publicResources.api';

// `as const` so the values stay literal types — t() takes a union of known
// keys, and a widened `string` would not be assignable to it. That check is
// the reason an untranslated key is a build error here rather than English
// text appearing on a Spanish page at church.
const INTEREST_KEYS = {
  RECEIVE_CHRIST: 'resources.interestReceiveChrist',
  LEARN_MORE: 'resources.interestLearnMore',
  JOIN_CHURCH: 'resources.interestJoinChurch',
  CELL_GROUP: 'resources.interestCellGroup',
} as const satisfies Record<ResourceInterest, string>;

export function ResourceResponseForm({ slug }: { slug: string }) {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wantsContact, setWantsContact] = useState(true);
  const [interests, setInterests] = useState<ResourceInterest[]>([]);
  const [prayerRequest, setPrayerRequest] = useState('');

  const submit = useMutation({
    mutationFn: () =>
      publicResourcesApi.respond(slug, {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        wantsContact,
        interests: interests.length ? interests : undefined,
        prayerRequest: prayerRequest.trim() || undefined,
        locale,
      }),
  });

  if (submit.isSuccess) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="mb-1 font-semibold text-slate-900">{t('resources.thanksTitle')}</h2>
        <p className="text-sm text-slate-600">{t('resources.thanksBody')}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <HeartHandshake className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-slate-900">{t('resources.reachOutTitle')}</span>
          <span className="mt-0.5 block text-sm text-slate-600">{t('resources.reachOutBody')}</span>
        </span>
      </button>
    );
  }

  const canSubmit =
    firstName.trim().length > 0 && (!wantsContact || Boolean(email.trim() || phone.trim()));

  return (
    <div className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-semibold text-slate-900">{t('resources.reachOutTitle')}</h2>
        <p className="mt-0.5 text-sm text-slate-600">{t('resources.reachOutBody')}</p>
      </div>

      {submit.isError && (
        <Alert variant="error">
          {(submit.error as AxiosError<ApiError>).response?.data?.message ?? t('resources.submitError')}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label={t('field.firstName')}
          placeholder="John"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          label={`${t('field.lastName')} (${t('field.optional')})`}
          placeholder="Smith"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label={t('field.email')}
          type="email"
          placeholder="john.smith@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label={t('field.phone')}
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <label className="flex items-start gap-2.5 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600"
          checked={wantsContact}
          onChange={(e) => setWantsContact(e.target.checked)}
        />
        {t('resources.wantsContact')}
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">
          {t('resources.interestsLabel')}
        </legend>
        <div className="space-y-2">
          {RESOURCE_INTERESTS.map((interest) => (
            <label key={interest} className="flex items-start gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600"
                checked={interests.includes(interest)}
                onChange={(e) =>
                  setInterests((current) =>
                    e.target.checked ? [...current, interest] : current.filter((i) => i !== interest)
                  )
                }
              />
              {t(INTEREST_KEYS[interest])}
            </label>
          ))}
        </div>
      </fieldset>

      <Textarea
        label={`${t('resources.prayerLabel')} (${t('field.optional')})`}
        rows={3}
        placeholder={t('resources.prayerPlaceholder')}
        value={prayerRequest}
        onChange={(e) => setPrayerRequest(e.target.value)}
      />
      <p className="text-xs text-slate-500">{t('resources.prayerPrivacy')}</p>

      <Button
        className="w-full"
        size="lg"
        isLoading={submit.isPending}
        disabled={!canSubmit}
        leftIcon={<Send className="h-4 w-4" />}
        onClick={() => submit.mutate()}
      >
        {t('resources.send')}
      </Button>
      {wantsContact && !email.trim() && !phone.trim() && (
        <p className="text-xs text-amber-700">{t('resources.needContact')}</p>
      )}
    </div>
  );
}
