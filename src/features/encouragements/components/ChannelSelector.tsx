import { MessageSquare, MessageCircle, Mail, Bell } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChannelOption {
  value: string;
  label: string;
  icon: ReactNode;
}

const CHANNEL_OPTIONS: ChannelOption[] = [
  { value: 'SMS', label: 'SMS', icon: <MessageSquare className="h-5 w-5" /> },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: <MessageCircle className="h-5 w-5" /> },
  { value: 'EMAIL', label: 'Email', icon: <Mail className="h-5 w-5" /> },
  { value: 'PUSH', label: 'Push Notification', icon: <Bell className="h-5 w-5" /> },
];

interface ChannelSelectorProps {
  value: string[];
  onChange: (channels: string[]) => void;
}

export function ChannelSelector({ value, onChange }: ChannelSelectorProps) {
  function handleToggle(channel: string) {
    if (value.includes(channel)) {
      onChange(value.filter((c) => c !== channel));
    } else {
      onChange([...value, channel]);
    }
  }

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Delivery Channels
      </label>

      <div className="flex flex-wrap gap-3">
        {CHANNEL_OPTIONS.map((option) => {
          const isSelected = value.includes(option.value);

          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all',
                isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(option.value)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />

              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  isSelected
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-slate-100 text-slate-500',
                )}
              >
                {option.icon}
              </div>

              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-indigo-900' : 'text-slate-700',
                )}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
