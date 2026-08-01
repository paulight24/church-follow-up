import { MessageSquare, Mail, Bell, Smartphone, Share2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { DELIVERABLE_CHANNELS, type DeliveryChannel } from '@/types/encouragement';

interface ChannelOption {
  value: DeliveryChannel;
  label: string;
  icon: ReactNode;
}

const CHANNEL_OPTIONS: ChannelOption[] = [
  { value: 'IN_APP', label: 'In-App', icon: <Bell className="h-5 w-5" /> },
  { value: 'EMAIL', label: 'Email', icon: <Mail className="h-5 w-5" /> },
  { value: 'SMS', label: 'SMS', icon: <MessageSquare className="h-5 w-5" /> },
  { value: 'PUSH', label: 'Push Notification', icon: <Smartphone className="h-5 w-5" /> },
];

/** How an attached image is actually delivered on each system channel - shown so the
 * constraint is visible instead of the option just being hidden. */
const IMAGE_DELIVERY_NOTE: Record<DeliveryChannel, string> = {
  IN_APP: 'Image shown in-app',
  EMAIL: 'Image embedded in the email',
  SMS: "Sent as a link (SMS can't embed images)",
  PUSH: 'Not delivered yet (channel coming soon)',
};

interface ChannelSelectorProps {
  value: DeliveryChannel[];
  onChange: (channels: DeliveryChannel[]) => void;
  /** Whether an image is currently attached, so per-channel delivery behavior can be shown. */
  hasImage?: boolean;
  /** Controls the separate "Share to WhatsApp" panel - WhatsApp is never sent by the system. */
  whatsAppShareEnabled?: boolean;
  onWhatsAppShareChange?: (enabled: boolean) => void;
}

export function ChannelSelector({
  value,
  onChange,
  hasImage = false,
  whatsAppShareEnabled = false,
  onWhatsAppShareChange,
}: ChannelSelectorProps) {
  function handleToggle(channel: DeliveryChannel) {
    if (value.includes(channel)) {
      onChange(value.filter((c) => c !== channel));
    } else {
      onChange([...value, channel]);
    }
  }

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Delivery Channels</label>

      <div className="flex flex-wrap gap-3">
        {CHANNEL_OPTIONS.map((option) => {
          const isSelected = value.includes(option.value);
          const isSupported = DELIVERABLE_CHANNELS.includes(option.value);

          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all',
                isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
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
                  isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500',
                )}
              >
                {option.icon}
              </div>

              <div>
                <span className={cn('text-sm font-medium', isSelected ? 'text-indigo-900' : 'text-slate-700')}>
                  {option.label}
                </span>
                {!isSupported && (
                  <p className="text-[11px] font-medium text-amber-600">Coming soon - not yet delivered</p>
                )}
                {isSupported && hasImage && isSelected && (
                  <p className="text-[11px] font-medium text-indigo-600">{IMAGE_DELIVERY_NOTE[option.value]}</p>
                )}
              </div>
            </label>
          );
        })}

        {/* WhatsApp is not a system-delivered channel - selecting it only reveals the
            client-side "Share to WhatsApp" affordance below, it never touches the
            dispatch pipeline or gets sent to the backend as a delivery channel. */}
        <label
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all',
            whatsAppShareEnabled ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
          )}
        >
          <input
            type="checkbox"
            checked={whatsAppShareEnabled}
            onChange={(e) => onWhatsAppShareChange?.(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />

          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              whatsAppShareEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500',
            )}
          >
            <Share2 className="h-5 w-5" />
          </div>

          <div>
            <span className={cn('text-sm font-medium', whatsAppShareEnabled ? 'text-emerald-900' : 'text-slate-700')}>
              WhatsApp
            </span>
            <p className="text-[11px] font-medium text-emerald-700">Share only - you send it, not the system</p>
          </div>
        </label>
      </div>
      <p className="mt-1.5 text-xs text-slate-400">
        In-App, Email, and SMS are delivered by the system. Push selections are recorded but skipped until that
        integration is live. WhatsApp is never sent automatically - checking it reveals a link you share yourself.
      </p>
    </div>
  );
}
