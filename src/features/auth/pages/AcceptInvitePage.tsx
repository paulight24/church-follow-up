import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import type { z } from 'zod';
import { Heart, Lock, Eye, EyeOff, CheckCircle2, Clock, LogIn, MailQuestion } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { resetPasswordSchema } from '@/lib/validators';
import { getPasswordStrength } from '@/lib/passwordStrength';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '../api/auth.api';
import type { ApiError } from '@/types';

// Same shape as reset-password (password + confirmPassword, same strength
// rule) - accepting an invite ends in the same place a reset does: a member
// with a working password. Reuse rather than reinvent per spec.
type AcceptInviteFormData = z.infer<typeof resetPasswordSchema>;

type InviteTokenState = 'valid' | 'expired' | 'already-accepted' | 'invalid';

function classifyTokenError(error: unknown): InviteTokenState {
  const response = (error as { response?: { status?: number; data?: ApiError } } | undefined)?.response;
  const code = response?.data?.code;

  if (code === 'INVITE_EXPIRED') return 'expired';
  if (code === 'INVITE_ALREADY_ACCEPTED') return 'already-accepted';
  if (code === 'INVITE_NOT_FOUND' || code === 'INVITE_INVALID') return 'invalid';

  // Fall back to conventional HTTP status if the backend didn't send a code
  // we recognize - 410 Gone for expired, 409 Conflict for already used.
  switch (response?.status) {
    case 410:
      return 'expired';
    case 409:
      return 'already-accepted';
    default:
      return 'invalid';
  }
}

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const token = searchParams.get('token') ?? '';

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inviteQuery = useQuery({
    queryKey: ['invite', token],
    queryFn: () => authApi.getInviteInfo(token).then((res) => res.data),
    enabled: !!token,
    retry: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password');
  const strength = passwordValue ? getPasswordStrength(passwordValue) : null;

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      const { data: session } = await authApi.acceptInvite({ token, password: data.password });
      setSession(session);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } catch (err: unknown) {
      const body = (err as { response?: { data?: ApiError } })?.response?.data;
      // The API's validation errors carry the real reason per field
      // ("Password must contain at least one number") in `errors`; the
      // top-level message is just "Validation failed". Surface the specific
      // lines - this page is reached from an email link by someone with no
      // account and nobody to ask, so a bare "Validation failed" is a wall.
      const detail = body?.errors
        ? Object.values(body.errors).flat().join(' ')
        : undefined;
      setSubmitError(detail || body?.message || 'Something went wrong setting your password. Please try again.');
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Member Care</h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          {!token ? (
            <InvalidInviteState />
          ) : inviteQuery.isLoading ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Spinner size="lg" className="text-indigo-600" />
              <p className="text-sm text-slate-500">Checking your invite...</p>
            </div>
          ) : inviteQuery.isError ? (
            <InviteErrorState state={classifyTokenError(inviteQuery.error)} />
          ) : isSuccess ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">You're all set!</h2>
              <p className="mt-2 text-sm text-slate-500">Taking you to your dashboard...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-slate-900">
                  Welcome, {inviteQuery.data?.firstName}!
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  We're so glad you're here. Set a password below and you're in — you'll be able to
                  see your follow-ups, updates, and more, all in one place.
                </p>
                {inviteQuery.data?.email && (
                  <p className="mt-3 text-xs text-slate-400">
                    Setting up access for <span className="font-medium text-slate-500">{inviteQuery.data.email}</span>
                  </p>
                )}
              </div>

              {submitError && (
                <div className="mb-4">
                  <Alert variant="error">{submitError}</Alert>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <Input
                    label="Create a password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter a password"
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
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  placeholder="Confirm your password"
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
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
                  Finish setting up my account
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InvalidInviteState() {
  return (
    <EmptyState
      icon={MailQuestion}
      title="This invite link isn't valid"
      description="Double-check the link from your email, or ask your church office to send you a new invite."
      action={
        <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Go to sign in
        </Link>
      }
    />
  );
}

function InviteErrorState({ state }: { state: InviteTokenState }) {
  if (state === 'already-accepted') {
    return (
      <EmptyState
        icon={LogIn}
        title="You've already set up your account"
        description="Looks like you've already created a password with this invite. Sign in with the password you chose."
        action={
          <Link to="/login">
            <Button leftIcon={<LogIn className="h-4 w-4" />}>Go to sign in</Button>
          </Link>
        }
      />
    );
  }

  if (state === 'expired') {
    return (
      <EmptyState
        icon={Clock}
        title="This invite link has expired"
        description="Invite links only stay active for a little while. Ask your church office to resend your invite and you'll be able to pick up right where you left off."
      />
    );
  }

  return <InvalidInviteState />;
}
