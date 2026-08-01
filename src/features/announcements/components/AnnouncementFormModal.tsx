import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, Pin, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { ImageAttachmentPicker } from '@/features/encouragements/components/ImageAttachmentPicker';
import { announcementsApi } from '../api/announcements.api';
import type { Announcement, AnnouncementAudience } from '@/types/announcement';
import type { MediaAssetSummary } from '@/types/encouragement';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Present when editing; omitted when creating a new announcement. */
  announcement?: Announcement | null;
}

function toLocalInputValue(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function errorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

interface AudienceOption {
  value: AnnouncementAudience;
  label: string;
  description: string;
  icon: LucideIcon;
  activeBorder: string;
  activeText: string;
}

/**
 * Deliberately spelled out in plain language rather than "ALL" / "STAFF_ONLY"
 * - this is the field the tech lead flagged as embarrassing to get wrong
 * (an internal note reaching the whole congregation, or vice versa), so the
 * two choices are large, described, and color-coded rather than a plain
 * dropdown a busy admin could click past.
 */
const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    value: 'ALL',
    label: 'Everyone, including members',
    description: 'Shows in the public feed and Dashboard - the whole congregation will see it.',
    icon: Users,
    activeBorder: 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300',
    activeText: 'text-emerald-800',
  },
  {
    value: 'STAFF_ONLY',
    label: 'Staff only',
    description: 'Hidden from ordinary members - only roles with staff-level permissions can see it.',
    icon: Lock,
    activeBorder: 'border-purple-400 bg-purple-50 ring-1 ring-purple-300',
    activeText: 'text-purple-800',
  },
];

export function AnnouncementFormModal({ isOpen, onClose, announcement }: AnnouncementFormModalProps) {
  const isEdit = Boolean(announcement);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState(announcement?.title ?? '');
  const [body, setBody] = useState(announcement?.body ?? '');
  const [imageAsset, setImageAsset] = useState<MediaAssetSummary | null>(announcement?.imageAsset ?? null);
  const [audience, setAudience] = useState<AnnouncementAudience>(announcement?.audience ?? 'ALL');
  const [isPinned, setIsPinned] = useState(announcement?.isPinned ?? false);
  const [publishAt, setPublishAt] = useState(toLocalInputValue(announcement?.publishAt ?? new Date().toISOString()));
  const [expiresAt, setExpiresAt] = useState(toLocalInputValue(announcement?.expiresAt));
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setBody('');
    setImageAsset(null);
    setAudience('ALL');
    setIsPinned(false);
    setPublishAt(toLocalInputValue(new Date().toISOString()));
    setExpiresAt('');
    setError(null);
  };

  const handleClose = () => {
    if (!isEdit) resetForm();
    onClose();
  };

  const mutation = useMutation({
    mutationFn: () => {
      const shared = {
        title: title.trim(),
        body: body.trim(),
        audience,
        isPinned,
        publishAt: publishAt ? new Date(publishAt).toISOString() : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      return isEdit
        ? announcementsApi.updateAnnouncement(announcement!.id, { ...shared, imageAssetId: imageAsset?.id ?? null })
        : announcementsApi.createAnnouncement({ ...shared, imageAssetId: imageAsset?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: isEdit ? 'Announcement updated' : 'Announcement created as a draft', variant: 'success' });
      handleClose();
    },
    onError: (err: unknown) => {
      toast({
        title: isEdit ? 'Could not update announcement' : 'Could not create announcement',
        description: errorMessage(err, 'Please try again.'),
        variant: 'error',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!body.trim()) {
      setError('Body is required.');
      return;
    }

    mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Announcement' : 'New Announcement'}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Draft'}
          </Button>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />

        <Textarea
          label="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          maxLength={20000}
          placeholder="What do you want the church to know?"
          required
        />

        <ImageAttachmentPicker value={imageAsset} onChange={setImageAsset} disabled={mutation.isPending} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Who can see this</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AUDIENCE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = audience === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAudience(opt.value)}
                  className={cn(
                    'flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-colors',
                    active ? opt.activeBorder : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <span className={cn('flex items-center gap-1.5 text-sm font-semibold', active ? opt.activeText : 'text-slate-700')}>
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </span>
                  <span className="text-xs text-slate-500">{opt.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <Pin className="h-3.5 w-3.5 text-slate-400" />
          Pin to the top of the feed
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Publish at"
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            helpText="When this becomes visible in the feed"
          />
          <Input
            label="Expires at (optional)"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            helpText="Leave blank to keep it up indefinitely"
          />
        </div>
      </form>
    </Modal>
  );
}
