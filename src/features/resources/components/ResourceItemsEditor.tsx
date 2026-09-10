/**
 * The list of things on a resource page, in the order they will appear.
 *
 * Each row is either a file we host or a link out, and the editor makes that
 * a first-class choice rather than a hidden detail — because it is an
 * editorial decision the church should keep making deliberately. Material the
 * church wrote belongs here, where it controls it; material somebody else
 * maintains better should stay theirs, or a rehosted copy quietly goes stale.
 */
import { useMutation } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ExternalLink, FileText, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { mediaAssetsApi } from '@/features/campaigns/api/campaigns.api';
import { downscaleImage } from '@/lib/imageDownscale';
import type { ResourceItemDraft, ResourceItemKind } from '@/types/resource';

const KIND_OPTIONS: Array<{ value: ResourceItemKind; label: string }> = [
  { value: 'FILE', label: 'A file we host' },
  { value: 'LINK', label: 'A link to another site' },
];

function formatSize(bytes?: number | null): string | null {
  if (typeof bytes !== 'number' || bytes <= 0) return null;
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function ResourceItemsEditor({
  value,
  onChange,
  disabled,
}: {
  value: ResourceItemDraft[];
  onChange: (items: ResourceItemDraft[]) => void;
  disabled?: boolean;
}) {
  const { toast } = useToast();

  const update = (index: number, patch: Partial<ResourceItemDraft>) =>
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const move = (index: number, delta: number) => {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const upload = useMutation({
    mutationFn: async ({ file, index }: { file: File; index: number }) => {
      // Images get resized in the browser first, same as the flier picker.
      // A PDF passes through untouched.
      const asset = await mediaAssetsApi.uploadMediaAsset(await downscaleImage(file));
      return { asset: asset.data, index };
    },
    onSuccess: ({ asset, index }) =>
      update(index, {
        mediaAssetId: asset.id,
        fileName: asset.filename,
        fileSizeBytes: asset.sizeBytes,
        // A church that has not titled the row yet almost always means the
        // file's own name, minus the extension nobody wants on a page.
        ...(value[index]?.title.trim() ? {} : { title: asset.filename.replace(/\.[^.]+$/, '') }),
      }),
    onError: () =>
      toast({ title: 'Could not upload that file', description: 'Try a different file.', variant: 'error' }),
  });

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={() => onChange([...value, { title: '', kind: 'FILE', active: true }])}
      >
        Add a resource
      </Button>

      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
          Nothing on this page yet. Add the books, magazines and links you want guests to be able to
          take away.
        </p>
      )}

      {value.map((item, index) => (
        <div key={item.id ?? `new-${index}`} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <span className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              {item.kind === 'LINK' ? <ExternalLink className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </span>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
                <Input
                  label="Title"
                  placeholder="Now That You Are Born Again"
                  value={item.title}
                  disabled={disabled}
                  onChange={(e) => update(index, { title: e.target.value })}
                />
                <Select
                  label="Where it lives"
                  value={item.kind}
                  disabled={disabled}
                  options={KIND_OPTIONS}
                  onChange={(e) =>
                    update(index, {
                      kind: e.target.value as ResourceItemKind,
                      // Clear the half that no longer applies, so a row can
                      // never be saved as a file with a leftover URL.
                      ...(e.target.value === 'FILE'
                        ? { externalUrl: null }
                        : { mediaAssetId: null, fileName: null, fileSizeBytes: null }),
                    })
                  }
                />
              </div>

              <Input
                label="Description (optional)"
                placeholder="A short guide to your new life in Christ"
                value={item.description ?? ''}
                disabled={disabled}
                onChange={(e) => update(index, { description: e.target.value })}
              />

              {item.kind === 'FILE' ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">File</label>
                  {item.mediaAssetId ? (
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1 truncate text-slate-700">
                        {item.fileName ?? 'Uploaded file'}
                      </span>
                      {formatSize(item.fileSizeBytes) && (
                        <span className="shrink-0 text-xs text-slate-500">
                          {formatSize(item.fileSizeBytes)}
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled}
                        onClick={() =>
                          update(index, { mediaAssetId: null, fileName: null, fileSizeBytes: null })
                        }
                      >
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600">
                      <Upload className="h-4 w-4" />
                      {upload.isPending && upload.variables?.index === index
                        ? 'Uploading…'
                        : 'Choose a PDF or image (up to 20MB)'}
                      <input
                        type="file"
                        className="hidden"
                        accept="application/pdf,image/png,image/jpeg,image/webp"
                        disabled={disabled || upload.isPending}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) upload.mutate({ file, index });
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <Input
                  label="Link"
                  placeholder="https://nowthatyouarebornagain.org"
                  value={item.externalUrl ?? ''}
                  disabled={disabled}
                  helpText="Opens in a new tab, so this page is still here when they come back."
                  onChange={(e) => update(index, { externalUrl: e.target.value })}
                />
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Language or edition (optional)"
                  placeholder="Español"
                  value={item.languageLabel ?? ''}
                  disabled={disabled}
                  onChange={(e) => update(index, { languageLabel: e.target.value })}
                />
                <div className="flex items-end gap-4 pb-1">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                      checked={item.active ?? true}
                      disabled={disabled}
                      onChange={(e) => update(index, { active: e.target.checked })}
                    />
                    Show on the page
                  </label>
                  {typeof item.downloadCount === 'number' && item.downloadCount > 0 && (
                    <span className="text-xs text-slate-500">
                      {item.downloadCount} {item.downloadCount === 1 ? 'download' : 'downloads'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                aria-label="Move up"
                disabled={disabled || index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                aria-label="Move down"
                disabled={disabled || index === value.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Remove"
                disabled={disabled}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
