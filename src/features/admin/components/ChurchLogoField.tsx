/**
 * The church's logo, uploaded once and used everywhere it is read — the
 * branded email shell and the public pages a first-timer reaches by QR code.
 *
 * It is a plain URL on the church row rather than an asset id, so this
 * uploads through the existing media-assets endpoint and stores the resulting
 * public URL. That is deliberate: the email layout hands this straight to a
 * mail client, which has to be able to fetch it without knowing anything
 * about us.
 */
import { useMutation } from '@tanstack/react-query';
import { ImageOff, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { mediaAssetsApi, mediaAssetUrl } from '@/features/campaigns/api/campaigns.api';
import { downscaleImage } from '@/lib/imageDownscale';

export function ChurchLogoField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const { toast } = useToast();

  const upload = useMutation({
    mutationFn: async (file: File) => mediaAssetsApi.uploadMediaAsset(await downscaleImage(file)),
    onSuccess: (res) => onChange(mediaAssetUrl(res.data)),
    onError: () =>
      toast({ title: 'Could not upload that image', description: 'Try a PNG or JPG.', variant: 'error' }),
  });

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Logo</label>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <ImageOff className="h-6 w-6 text-slate-300" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:border-indigo-400 hover:text-indigo-600">
            <Upload className="h-4 w-4" />
            {upload.isPending ? 'Uploading…' : value ? 'Replace logo' : 'Upload a logo'}
            <input
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              disabled={disabled || upload.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload.mutate(file);
                e.target.value = '';
              }}
            />
          </label>
          <p className="text-xs text-slate-500">
            Shown on your public pages and at the top of every email you send. A square PNG with a
            transparent background works best.
          </p>
          {value && (
            <Button variant="ghost" size="sm" disabled={disabled} onClick={() => onChange('')}>
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
