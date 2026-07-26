import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return format(parsed, formatStr);
}

export function formatDateTime(date: string | Date): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return format(parsed, 'MMM d, yyyy h:mm a');
}

export function formatRelativeDate(date: string | Date): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(parsed, { addSuffix: true });
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function formatMemberName(member: {
  firstName: string;
  lastName: string;
  preferredName?: string | null;
}): string {
  const displayFirst = member.preferredName ?? member.firstName;
  return `${displayFirst} ${member.lastName}`.trim();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}
