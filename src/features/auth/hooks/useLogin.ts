import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { loginSchema } from '@/lib/validators';
import { useAuth } from '@/hooks/useAuth';

type LoginFormData = z.infer<typeof loginSchema>;

export function useLogin() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setError(null);
    try {
      await login(data.email, data.password);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(
          axiosError.response?.data?.message ?? 'Invalid email or password. Please try again.',
        );
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  });

  return {
    register: form.register,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    onSubmit,
    error,
    clearError: () => setError(null),
  };
}
