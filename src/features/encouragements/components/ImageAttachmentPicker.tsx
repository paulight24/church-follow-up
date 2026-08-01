import { useMutation } from '@tanstack/react-query';
import { FileText, X } from 'lucide-react';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/Toast';
import { mediaAssetsApi, mediaAssetUrl } from '../api/encouragements.api';
import type { MediaAssetSummary } from '@/types/encouragement';

// Mirrors backend media-assets.upload.ts's ALLOWED_MIME_TYPES / 10MB limit.
const ACCEPTED_TYPES = 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml,application/pdf';
const MAX_SIZE_MB = 10;

interface ImageAttachmentPickerProps {
  value: MediaAssetSummary | null;
  onChange: (asset: MediaAssetSummary | null) => void;
  disabled?: boolean;
}

/**
 * Lets the Pastor attach a flier/post-card image to an encouragement. Uploads
 * through the existing media-assets endpoint (shared with campaigns) and
 * hands the resulting asset back to the caller, which is responsible for
 * sending its `id` as `imageAssetId` on create/quick-send/update.
 */
export function ImageAttachmentPicker({ value, onChange, disabled }: ImageAttachmentPickerProps) {
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaAssetsApi.uploadMediaAsset(file),
    onSuccess: (res) => onChange(res.data),
    onError: (error: any) => {
      toast({
        title: 'Could not upload image',
        description: error?.response?.data?.message ?? 'Please try a different file.',
        variant: 'error',
      });
    },
  });

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Image / Flier (optional)</label>

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          {value.mimeType.startsWith('image/') ? (
            <img
              src={mediaAssetUrl(value)}
              alt={value.filename}
              className="h-14 w-14 shrink-0 rounded object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-slate-100">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">{value.filename}</p>
            <p className="text-xs text-slate-500">Attached to this message</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            className="shrink-0 rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <FileUpload
          accept={ACCEPTED_TYPES}
          maxSizeMB={MAX_SIZE_MB}
          helpText={`PNG, JPEG, GIF, WEBP, SVG, or PDF up to ${MAX_SIZE_MB}MB${uploadMutation.isPending ? ' - uploading...' : ''}`}
          onFileSelect={(file) => uploadMutation.mutate(file)}
        />
      )}
    </div>
  );
}
