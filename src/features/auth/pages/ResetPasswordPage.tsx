import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { ArrowLeft, Heart, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { resetPasswordSchema } from '@/lib/validators';
import { getPasswordStrength } from '@/lib/passwordStrength';
import { authApi } from '../api/auth.api';

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');
  const strength = passwordValue ? getPasswordStrength(passwordValue) : null;

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await authApi.resetPassword({ token, password: data.password });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(
          axiosError.response?.data?.message ??
            'Failed to reset password. The link may have expired.',
        );
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Member Care</h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Password reset successful</h2>
              <p className="mt-2 text-sm text-slate-500">
                Your password has been updated. You will be redirected to the login page shortly.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft className="h-4 w-4" />
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Set new password</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a strong password for your account.
                </p>
              </div>

              {error && (
                <div className="mb-4">
                  <Alert variant="error">{error}</Alert>
                </div>
              )}

              {!token && (
                <div className="mb-4">
                  <Alert variant="warning">
                    Invalid or missing reset token. Please request a new password reset link.
                  </Alert>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <Input
                    label="New password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="pointer-events-auto cursor-pointer text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
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

                  {strength && (
                    <div className="mt-2">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Password strength</span>
                        <span
                          className={`text-xs font-medium ${
                            strength.level === 'weak'
                              ? 'text-rose-600'
                              : strength.level === 'medium'
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                          }`}
                        >
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="pointer-events-auto cursor-pointer text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={!token}
                  className="w-full"
                  size="lg"
                >
                  Reset password
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
