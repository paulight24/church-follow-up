import { useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

function ToolbarButton({ icon, title, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded',
        'text-slate-600 transition-colors',
        'hover:bg-slate-100 hover:text-slate-900',
        'active:bg-slate-200',
      )}
    >
      {icon}
    </button>
  );
}

interface WYSIWYGEditorProps {
  content: string;
  onChange: (html: string) => void;
  /**
   * When provided, the "Insert Image" toolbar button hands control to the caller
   * (e.g. to open the media library) instead of prompting for a raw URL. Call the
   * given `insert` callback with a chosen image URL to insert it at the cursor.
   */
  onInsertImage?: (insert: (url: string) => void) => void;
}

export function WYSIWYGEditor({ content, onChange, onInsertImage }: WYSIWYGEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInsertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const handleInsertImage = useCallback(() => {
    if (onInsertImage) {
      onInsertImage((url) => execCommand('insertImage', url));
      return;
    }
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  }, [execCommand, onInsertImage]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b border-slate-200 bg-slate-50 p-2">
        {/* Text formatting */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={<Bold className="h-4 w-4" />}
            title="Bold"
            onClick={() => execCommand('bold')}
          />
          <ToolbarButton
            icon={<Italic className="h-4 w-4" />}
            title="Italic"
            onClick={() => execCommand('italic')}
          />
          <ToolbarButton
            icon={<Underline className="h-4 w-4" />}
            title="Underline"
            onClick={() => execCommand('underline')}
          />
        </div>

        <div className="mx-1 w-px self-stretch bg-slate-200" />

        {/* Headings */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={<Heading1 className="h-4 w-4" />}
            title="Heading 1"
            onClick={() => execCommand('formatBlock', 'h1')}
          />
          <ToolbarButton
            icon={<Heading2 className="h-4 w-4" />}
            title="Heading 2"
            onClick={() => execCommand('formatBlock', 'h2')}
          />
          <ToolbarButton
            icon={<Heading3 className="h-4 w-4" />}
            title="Heading 3"
            onClick={() => execCommand('formatBlock', 'h3')}
          />
        </div>

        <div className="mx-1 w-px self-stretch bg-slate-200" />

        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={<List className="h-4 w-4" />}
            title="Bullet List"
            onClick={() => execCommand('insertUnorderedList')}
          />
          <ToolbarButton
            icon={<ListOrdered className="h-4 w-4" />}
            title="Numbered List"
            onClick={() => execCommand('insertOrderedList')}
          />
        </div>

        <div className="mx-1 w-px self-stretch bg-slate-200" />

        {/* Insert */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={<Link className="h-4 w-4" />}
            title="Insert Link"
            onClick={handleInsertLink}
          />
          <ToolbarButton
            icon={<Image className="h-4 w-4" />}
            title="Insert Image"
            onClick={handleInsertImage}
          />
        </div>

        <div className="mx-1 w-px self-stretch bg-slate-200" />

        {/* Alignment */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={<AlignLeft className="h-4 w-4" />}
            title="Align Left"
            onClick={() => execCommand('justifyLeft')}
          />
          <ToolbarButton
            icon={<AlignCenter className="h-4 w-4" />}
            title="Align Center"
            onClick={() => execCommand('justifyCenter')}
          />
          <ToolbarButton
            icon={<AlignRight className="h-4 w-4" />}
            title="Align Right"
            onClick={() => execCommand('justifyRight')}
          />
        </div>
      </div>

      {/* Editor content area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: content }}
        className={cn(
          'min-h-[200px] px-4 py-3 text-sm text-slate-900',
          'focus:outline-none',
          '[&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold',
          '[&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold',
          '[&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-medium',
          '[&_p]:mb-2 [&_p]:leading-relaxed',
          '[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-6',
          '[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-6',
          '[&_li]:mb-1',
          '[&_a]:text-indigo-600 [&_a]:underline',
          '[&_img]:my-2 [&_img]:max-w-full [&_img]:rounded',
        )}
      />
    </div>
  );
}
