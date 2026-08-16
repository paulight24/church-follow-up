import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { Heart, Church, MapPin, Mail, Lock, User, Phone, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { registerChurch } from '@/features/churches/api';
import { useSeo } from '@/lib/seo';
import { LanguageSwitcher, useTranslation } from '@/i18n';

const schema = z
  .object({
    churchName: z.string().min(3, 'Church name must be at least 3 characters').max(120),
    city: z.string().max(80).optional().or(z.literal('')),
    stateOrProvince: z.string().max(80).optional().or(z.literal('')),
    adminFirstName: z.string().min(1, 'First name is required').max(60),
    adminLastName: z.string().min(1, 'Last name is required').max(60),
    adminEmail: z.string().email('Enter a valid email address').max(160),
    adminPhone: z.string().max(30).optional().or(z.literal('')),
    adminPassword: z
      .string()
      .min(10, 'At least 10 characters')
      .regex(/[A-Z]/, 'Needs an uppercase letter')
      .regex(/[a-z]/, 'Needs a lowercase letter')
      .regex(/[0-9]/, 'Needs a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.adminPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterChurchPage() {
  const { t } = useTranslation();
  useSeo({
    title: t('signup.seoTitle'),
    description: t('signup.seoDescription'),
    path: '/register-church',
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<{ name: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await registerChurch({
        churchName: values.churchName,
        city: values.city || undefined,
        stateOrProvince: values.stateOrProvince || undefined,
        adminFirstName: values.adminFirstName,
        adminLastName: values.adminLastName,
        adminEmail: values.adminEmail,
        adminPhone: values.adminPhone || undefined,
        adminPassword: values.adminPassword,
      });
      setRegistered({ name: result.name });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; error?: { message?: string } }>;
      const body = axiosErr.response?.data;
      setServerError(
        body?.message ?? body?.error?.message ?? 'Something went wrong — please try again.',
      );
    }
  });

  if (registered) {
    return (
      <PublicShell>
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">{t('signup.successTitle', { name: registered.name })}</h1>
          <p className="mt-3 text-slate-600">
            {t('signup.successBody')}
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            {t('signup.successCta')}
          </Link>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="mx-auto w-full max-w-xl">
        <Link to="/welcome" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          {t('signup.back')}
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{t('signup.heading')}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('signup.subheading')}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {serverError && <Alert variant="error">{serverError}</Alert>}

            <div className="border-b border-slate-100 pb-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">{t('signup.sectionChurch')}</h2>
              <div className="space-y-4">
                <Input
                  label={t('signup.churchName')}
                  placeholder="e.g. Christ Embassy Houston"
                  leftIcon={<Church className="h-4 w-4" />}
                  error={errors.churchName?.message}
                  {...register('churchName')}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('signup.city')}
                    placeholder="Houston"
                    leftIcon={<MapPin className="h-4 w-4" />}
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <Input
                    label={t('signup.state')}
                    placeholder="TX"
                    error={errors.stateOrProvince?.message}
                    {...register('stateOrProvince')}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">{t('signup.sectionAdmin')}</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('signup.firstName')}
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.adminFirstName?.message}
                    {...register('adminFirstName')}
                  />
                  <Input
                    label={t('signup.lastName')}
                    error={errors.adminLastName?.message}
                    {...register('adminLastName')}
                  />
                </div>
                <Input
                  label={t('signup.email')}
                  type="email"
                  placeholder="you@church.org"
                  autoComplete="email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.adminEmail?.message}
                  {...register('adminEmail')}
                />
                <Input
                  label={t('signup.phone')}
                  type="tel"
                  placeholder="(555) 123-4567"
                  leftIcon={<Phone className="h-4 w-4" />}
                  error={errors.adminPhone?.message}
                  {...register('adminPhone')}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('signup.password')}
                    type="password"
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.adminPassword?.message}
                    {...register('adminPassword')}
                  />
                  <Input
                    label={t('signup.confirmPassword')}
                    type="password"
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              {t('signup.submit')}
            </Button>

            <p className="text-center text-sm text-slate-500">
              {t('signup.alreadyUsing')}{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                {t('signup.signIn')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </PublicShell>
  );
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/welcome" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Member Care</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">{children}</main>
    </div>
  );
}
