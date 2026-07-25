import { ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export function MediaLibrary() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center text-center">
          <ImageIcon className="h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Media Library Coming Soon
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Manage images, documents, and media files for your campaigns.
            Upload, organize, and reuse assets across all your outreach
            communications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
