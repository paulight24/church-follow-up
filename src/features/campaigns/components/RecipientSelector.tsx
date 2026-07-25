import { Users, UsersRound, Filter, Upload } from 'lucide-react';
import { cn } from '@/lib/cn';

const recipientOptions = [
  {
    value: 'all',
    label: 'All Members',
    description: 'Send to every member in the church database',
    icon: Users,
    count: 1247,
  },
  {
    value: 'by-team',
    label: 'By Team',
    description: 'Target specific teams like ushers, choir, media',
    icon: UsersRound,
    count: null,
  },
  {
    value: 'by-status',
    label: 'By Status',
    description: 'Filter by member status such as new, active, first timer',
    icon: Filter,
    count: null,
  },
  {
    value: 'custom',
    label: 'Custom List',
    description: 'Upload or manually select recipients',
    icon: Upload,
    count: null,
  },
] as const;

interface RecipientSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RecipientSelector({ value, onChange }: RecipientSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {recipientOptions.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              {/* Radio dot */}
              <span
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                  isSelected
                    ? 'border-indigo-600'
                    : 'border-slate-300',
                )}
              >
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className={cn(
                    'h-4 w-4',
                    isSelected ? 'text-indigo-600' : 'text-slate-400',
                  )} />
                  <span className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-indigo-900' : 'text-slate-900',
                  )}>
                    {option.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{option.description}</p>
                {option.count !== null && isSelected && (
                  <p className="mt-2 text-xs font-medium text-indigo-600">
                    ~{option.count.toLocaleString()} recipients
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Conditional sub-options */}
      {value === 'by-team' && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Select Team
          </label>
          <select
            disabled
            className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option>Select team...</option>
          </select>
          <p className="mt-1.5 text-xs text-slate-400">
            Team selection will be available when connected to the API
          </p>
        </div>
      )}

      {value === 'by-status' && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Select Status
          </label>
          <select
            disabled
            className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option>Select status...</option>
          </select>
          <p className="mt-1.5 text-xs text-slate-400">
            Status filtering will be available when connected to the API
          </p>
        </div>
      )}

      {value === 'custom' && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
          <Upload className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-600">
            Upload member list or search to add individually
          </p>
          <p className="mt-1 text-xs text-slate-400">
            CSV, Excel, or manual selection supported
          </p>
        </div>
      )}
    </div>
  );
}
