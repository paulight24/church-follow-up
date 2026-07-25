import * as React from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  helpText?: string;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  onFileSelect,
  accept,
  maxSizeMB = 5,
  label,
  helpText,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    if (accept) {
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const fileType = file.type;
      const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;

      const isAccepted = acceptedTypes.some(
        (type) =>
          type === fileType ||
          type === fileExt ||
          (type.endsWith('/*') && fileType.startsWith(type.replace('/*', '/'))),
      );

      if (!isAccepted) {
        setError(`Invalid file type. Accepted: ${accept}`);
        return false;
      }
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      )}

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors',
            isDragging
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100',
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <UploadCloud
            className={cn(
              'mb-3 h-10 w-10',
              isDragging ? 'text-indigo-500' : 'text-slate-400',
            )}
            strokeWidth={1.5}
          />
          <p className="text-sm font-medium text-slate-700">
            Drag & drop a file here, or{' '}
            <span className="text-indigo-600">browse</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Max file size: {maxSizeMB}MB
            {accept && ` | Accepted: ${accept}`}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <File className="h-5 w-5 shrink-0 text-indigo-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button
            onClick={handleClear}
            className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />

      {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
      {!error && helpText && (
        <p className="mt-1.5 text-sm text-slate-500">{helpText}</p>
      )}
    </div>
  );
}
