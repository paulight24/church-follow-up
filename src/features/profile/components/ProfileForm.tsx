import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react';
import type { Member } from '@/types/member';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { ProfileOptions } from '../api/profile.api';

const profileFormSchema = z.object({
  preferredName: z.string().max(150).optional().or(z.literal('')),
  phonePrimary: z.string().max(30).optional().or(z.literal('')),
  phoneSecondary: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  weddingAnniversary: z.string().optional().or(z.literal('')),
  communicationConsentWhatsapp: z.boolean().optional(),
  title: z.string().max(40).optional().or(z.literal('')),
  // Title-case to match what is already stored — upper-case codes would fail
  // to match every existing record and blank the field on load.
  bornAgainStatus: z.enum(['Yes', 'No', 'Unknown', '']).optional(),
  departmentId: z.string().optional().or(z.literal('')),
  fellowshipGroupId: z.string().optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  member: Member;
  /** The church's own departments and cell groups; may still be loading. */
  options?: ProfileOptions;
  onSubmit: (values: ProfileFormValues) => void;
  isSubmitting: boolean;
}

const bornAgainOptions = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
  { label: 'Not sure', value: 'Unknown' },
];

function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function ProfileForm({ member, options, onSubmit, isSubmitting }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      preferredName: member.preferredName ?? '',
      phonePrimary: member.phonePrimary ?? '',
      phoneSecondary: member.phoneSecondary ?? '',
      email: member.email ?? '',
      dateOfBirth: toDateInputValue(member.dateOfBirth),
      weddingAnniversary: toDateInputValue(member.weddingAnniversary),
      communicationConsentWhatsapp: member.communicationConsentWhatsapp ?? false,
      title: member.title ?? '',
      bornAgainStatus: (member.bornAgainStatus as ProfileFormValues['bornAgainStatus']) ?? '',
      departmentId: member.departmentId ?? '',
      fellowshipGroupId: member.fellowshipGroupId ?? '',
    },
  });

  // Until the lists arrive, offer the member's current choice as the only
  // option rather than an empty dropdown that reads as "not set".
  const departmentOptions =
    options?.departments.map((d) => ({ label: d.name, value: d.id })) ??
    (member.department ? [{ label: member.department.name, value: member.department.id }] : []);
  const cellGroupOptions =
    options?.cellGroups.map((c) => ({ label: c.name, value: c.id })) ??
    (member.fellowshipGroup ? [{ label: member.fellowshipGroup.name, value: member.fellowshipGroup.id }] : []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Preferred name"
          placeholder="What should we call you?"
          helpText="Shown instead of your first name across the app."
          error={errors.preferredName?.message}
          {...register('preferredName')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Primary phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          error={errors.phonePrimary?.message}
          {...register('phonePrimary')}
        />
        <Input
          label="Secondary phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          error={errors.phoneSecondary?.message}
          {...register('phoneSecondary')}
        />
        <Input
          label="Date of birth"
          type="date"
          error={errors.dateOfBirth?.message}
          {...register('dateOfBirth')}
        />
        <Input
          label="Wedding anniversary"
          type="date"
          error={errors.weddingAnniversary?.message}
          {...register('weddingAnniversary')}
        />
      </div>

      {/* Things the member knows about themselves that the church office
          would otherwise have to key in. Deliberately four fields and no
          more: every extra box here is one more reason not to finish. */}
      <div className="border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">About you in church</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Optional, and you can change any of it later.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="Title"
              placeholder="Bro., Sis., Dcn., Pastor"
              list="profile-title-options"
              error={errors.title?.message}
              {...register('title')}
            />
            <datalist id="profile-title-options">
              <option value="Bro." />
              <option value="Sis." />
              <option value="Dcn." />
              <option value="Dcns." />
              <option value="Pastor" />
              <option value="Brother" />
              <option value="Sister" />
              <option value="Deacon" />
            </datalist>
          </div>
          <Select
            label="Are you born again?"
            placeholder="Select an answer"
            options={bornAgainOptions}
            error={errors.bornAgainStatus?.message}
            {...register('bornAgainStatus')}
          />
          <Select
            label="Department"
            placeholder="Select your department"
            options={departmentOptions}
            error={errors.departmentId?.message}
            {...register('departmentId')}
          />
          <div>
            <Select
              label="Cell group"
              placeholder={cellGroupOptions.length ? 'Select your cell group' : 'No cell groups set up yet'}
              options={cellGroupOptions}
              disabled={cellGroupOptions.length === 0}
              error={errors.fellowshipGroupId?.message}
              {...register('fellowshipGroupId')}
            />
            {/* Most churches on this app have not created cell groups yet, and
                an empty dropdown reads as a broken form rather than as an
                empty list. Say which it is. */}
            {cellGroupOptions.length === 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Your church has not added cell groups yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
        <label className="flex items-start gap-2.5 text-sm text-slate-800">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            {...register('communicationConsentWhatsapp')}
          />
          <span>
            <span className="font-medium">Message me on WhatsApp</span>
            <p className="mt-0.5 text-xs text-slate-600">
              This is off by default. Turn it on if you&apos;re fine with the church reaching you on WhatsApp - you
              can turn it back off here at any time.
            </p>
          </span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button
          type="submit"
          leftIcon={<Save className="h-4 w-4" />}
          isLoading={isSubmitting}
          disabled={!isDirty}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
