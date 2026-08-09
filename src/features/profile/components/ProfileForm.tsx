import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react';
import type { Member } from '@/types/member';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const profileFormSchema = z.object({
  preferredName: z.string().max(150).optional().or(z.literal('')),
  phonePrimary: z.string().max(30).optional().or(z.literal('')),
  phoneSecondary: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  weddingAnniversary: z.string().optional().or(z.literal('')),
  communicationConsentWhatsapp: z.boolean().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  member: Member;
  onSubmit: (values: ProfileFormValues) => void;
  isSubmitting: boolean;
}

function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function ProfileForm({ member, onSubmit, isSubmitting }: ProfileFormProps) {
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
    },
  });

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
          placeholder="+234 801 234 5678"
          error={errors.phonePrimary?.message}
          {...register('phonePrimary')}
        />
        <Input
          label="Secondary phone"
          type="tel"
          placeholder="+234 801 234 5678"
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
