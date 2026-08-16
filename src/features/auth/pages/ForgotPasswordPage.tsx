import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Heart, Mail } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authApi } from '../api/auth.api';
import { LanguageSwitcher, useTranslation } from '@/i18n';

const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await authApi.forgotPassword(data);
      setIsSuccess(true);
    } catch (err: unknown) {
      // Always show success to prevent email enumeration
      setIsSuccess(true);
      void err;
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-2 flex justify-end">
            <LanguageSwitcher />
          </div>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Member Care</h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{t('auth.checkEmailTitle')}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {t('auth.checkEmailBody')}
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('auth.backToSignIn')}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">{t('auth.forgotTitle')}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('auth.forgotBody')}
                </p>
              </div>

              {error && (
                <div className="mb-4">
                  <Alert variant="error">{error}</Alert>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <Input
                  label={t('auth.email')}
                  type="email"
                  placeholder="you@church.org"
                  autoComplete="email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {t('auth.sendResetLink')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('auth.backToSignIn')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
