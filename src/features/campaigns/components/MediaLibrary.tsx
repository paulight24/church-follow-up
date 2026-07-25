import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageIcon, FileText, Trash2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { mediaAssetsApi, mediaAssetUrl, type MediaAsset } from '../api/campaigns.api';

interface MediaLibraryProps {
  /** When provided, clicking an asset selects it instead of just previewing/managing it. */
  onSelect?: (url: string, asset: MediaAsset) => void;
  selectedAssetId?: string | null;
}

export function MediaLibrary({ onSelect, selectedAssetId }: MediaLibraryProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['media-assets'],
    queryFn: () => mediaAssetsApi.getMediaAssets({ pageSize: 60 }).then((res) => res.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaAssetsApi.uploadMediaAsset(file),
    onSuccess: () => {
      toast({ title: 'Media uploaded', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error?.response?.data?.message ?? 'Please try a different file.',
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaAssetsApi.deleteMediaAsset(id),
    onSuccess: () => {
      toast({ title: 'Media asset deleted', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
    onError: () => {
      toast({ title: 'Failed to delete asset', variant: 'error' });
    },
  });

  const assets = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Library</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload
          label="Upload a new image"
          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,application/pdf"
          maxSizeMB={10}
          helpText="PNG, JPEG, GIF, WEBP, SVG, or PDF up to 10MB"
          onFileSelect={(file) => uploadMutation.mutate(file)}
        />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="text-indigo-600" />
          </div>
        ) : isError ? (
          <p className="py-4 text-center text-sm text-rose-600">Could not load the media library.</p>
        ) : assets.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No media yet"
            description="Upload images to reuse them across campaigns and encouragements."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {assets.map((asset) => {
              const url = mediaAssetUrl(asset);
              const isImage = asset.mimeType.startsWith('image/');
              const isSelected = selectedAssetId === asset.id;
              return (
                <div
                  key={asset.id}
                  className={cn(
                    'group relative overflow-hidden rounded-lg border',
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-slate-200',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect?.(url, asset)}
                    className="flex h-24 w-full items-center justify-center bg-slate-50"
                    title={onSelect ? 'Select this asset' : asset.filename}
                  >
                    {isImage ? (
                      <img src={url} alt={asset.filename} className="h-full w-full object-cover" />
                    ) : (
                      <FileText className="h-8 w-8 text-slate-300" />
                    )}
                  </button>
                  {isSelected && (
                    <span className="absolute right-1 top-1 rounded-full bg-indigo-600 p-0.5 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-1 bg-white px-2 py-1">
                    <p className="truncate text-xs text-slate-600" title={asset.filename}>
                      {asset.filename}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(asset.id)}
                      className="shrink-0 rounded p-0.5 text-slate-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                      aria-label={`Delete ${asset.filename}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteMutation.mutate(pendingDeleteId);
        }}
        title="Delete media asset"
        message="This will permanently remove the file. Any campaigns or encouragements referencing it will keep the broken link."
        confirmText="Delete"
        variant="danger"
      />
    </Card>
  );
}
