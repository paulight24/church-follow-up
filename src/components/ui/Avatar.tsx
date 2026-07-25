import * as React from 'react';
import { cn } from '@/lib/cn';

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const;

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const initials = name ? getInitials(name) : '?';
  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        !showImage && 'bg-indigo-100 font-medium text-indigo-700',
        sizeClasses[size],
        className,
      )}
      aria-label={alt ?? name ?? 'Avatar'}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? name ?? 'Avatar'}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
