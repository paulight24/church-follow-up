import { Users, UserPlus, Cake, Crown, Filter } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface AudienceOption {
  value: string;
  label: string;
  description: string;
  estimatedCount: number;
  icon: ReactNode;
}

const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    value: 'all_members',
    label: 'All Members',
    description: 'Send to every registered member',
    estimatedCount: 450,
    icon: <Users className="h-5 w-5" />,
  },
  {
    value: 'new_members',
    label: 'New Members This Month',
    description: 'Members who joined this month',
    estimatedCount: 28,
    icon: <UserPlus className="h-5 w-5" />,
  },
  {
    value: 'birthday_week',
    label: 'Birthday This Week',
    description: 'Members celebrating birthdays',
    estimatedCount: 12,
    icon: <Cake className="h-5 w-5" />,
  },
  {
    value: 'leaders',
    label: 'Leaders',
    description: 'Department heads and team leads',
    estimatedCount: 45,
    icon: <Crown className="h-5 w-5" />,
  },
  {
    value: 'custom',
    label: 'Custom Group',
    description: 'Select specific members',
    estimatedCount: 0,
    icon: <Filter className="h-5 w-5" />,
  },
];

interface AudienceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function AudienceSelector({ value, onChange }: AudienceSelectorProps) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Target Audience
      </label>

      <div className="grid gap-2">
        {AUDIENCE_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all',
                isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  isSelected
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-slate-100 text-slate-500',
                )}
              >
                {option.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-indigo-900' : 'text-slate-900',
                    )}
                  >
                    {option.label}
                  </span>
                  {option.estimatedCount > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        isSelected
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      ~{option.estimatedCount} recipients
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{option.description}</p>
              </div>

              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-slate-300 bg-white',
                )}
              >
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
