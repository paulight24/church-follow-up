export interface PasswordStrength {
  level: 'weak' | 'medium' | 'strong';
  label: string;
  color: string;
  width: string;
}

/**
 * Purely cosmetic strength meter shown alongside the password field on
 * /reset-password and /accept-invite. The actual minimum bar a password must
 * clear lives in `passwordSchema` (src/lib/validators.ts) - this just gives
 * the user a visual nudge toward something stronger than the bare minimum.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { level: 'weak', label: 'Weak', color: 'bg-rose-500', width: 'w-1/3' };
  }
  if (score <= 4) {
    return { level: 'medium', label: 'Medium', color: 'bg-amber-500', width: 'w-2/3' };
  }
  return { level: 'strong', label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
}
