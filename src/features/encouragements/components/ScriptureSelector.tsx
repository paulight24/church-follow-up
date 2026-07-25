import { useState, useRef, useEffect } from 'react';
import { Book, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Scripture {
  reference: string;
  text: string;
}

const SCRIPTURES: Scripture[] = [
  { reference: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.' },
  { reference: 'Psalm 23:1', text: 'The Lord is my shepherd, I lack nothing.' },
  { reference: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.' },
  { reference: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { reference: 'Isaiah 40:31', text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
  { reference: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
  { reference: 'Joshua 1:9', text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
  { reference: 'Psalm 46:1', text: 'God is our refuge and strength, an ever-present help in trouble.' },
  { reference: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
  { reference: '2 Timothy 1:7', text: 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.' },
  { reference: 'Psalm 27:1', text: 'The Lord is my light and my salvation — whom shall I fear? The Lord is the stronghold of my life — of whom shall I be afraid?' },
  { reference: 'Romans 15:13', text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.' },
  { reference: 'Psalm 91:1-2', text: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, "He is my refuge and my fortress, my God, in whom I trust."' },
  { reference: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.' },
];

interface ScriptureSelectorProps {
  value: string;
  onChange: (reference: string, text: string) => void;
}

export function ScriptureSelector({ value, onChange }: ScriptureSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedScripture = SCRIPTURES.find((s) => s.reference === value);

  const filteredScriptures = SCRIPTURES.filter((scripture) =>
    scripture.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scripture.text.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(scripture: Scripture) {
    onChange(scripture.reference, scripture.text);
    setSearchQuery('');
    setIsOpen(false);
  }

  function handleClear() {
    onChange('', '');
    setSearchQuery('');
  }

  return (
    <div className="w-full" ref={containerRef}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Scripture Reference
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Book className="h-4 w-4" />
        </div>

        <input
          type="text"
          placeholder="Search scriptures..."
          value={isOpen ? searchQuery : value}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            'h-10 w-full rounded-lg border bg-white pl-10 pr-16 text-sm transition-colors',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/30',
          )}
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded p-0.5 text-slate-400 hover:text-slate-600"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full max-w-md overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filteredScriptures.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No scriptures found
            </div>
          ) : (
            filteredScriptures.map((scripture) => (
              <button
                key={scripture.reference}
                type="button"
                onClick={() => handleSelect(scripture)}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                  value === scripture.reference && 'bg-indigo-50',
                )}
              >
                <Book className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">
                      {scripture.reference}
                    </span>
                    {value === scripture.reference && (
                      <Check className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                    {scripture.text}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {selectedScripture && !isOpen && (
        <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
          <p className="text-sm italic text-indigo-800">
            &ldquo;{selectedScripture.text}&rdquo;
          </p>
          <p className="mt-1 text-xs font-medium text-indigo-600">
            &mdash; {selectedScripture.reference}
          </p>
        </div>
      )}
    </div>
  );
}
