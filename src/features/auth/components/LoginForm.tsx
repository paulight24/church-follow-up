import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useLogin } from '../hooks/useLogin';
import { useTranslation } from '@/i18n';

export function LoginForm() {
  const { t } = useTranslation();
  const { register, errors, isSubmitting, onSubmit, error, clearError } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <Alert variant="error" onDismiss={clearError}>
          {error}
        </Alert>
      )}

      <Input
        label={t('auth.email')}
        type="email"
        placeholder="you@church.org"
        autoComplete="email"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <div>
        <Input
          label={t('auth.password')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.passwordPlaceholder')}
          autoComplete="current-password"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="pointer-events-auto cursor-pointer text-slate-400 hover:text-slate-600"
              tabIndex={-1}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          {t('auth.rememberMe')}
        </label>
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          {t('auth.forgotPassword')}
        </Link>
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full"
        size="lg"
      >
        {t('auth.signIn')}
      </Button>
    </form>
  );
}
