import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/cn';
import { OUTCOMES } from '@/lib/constants';

interface CallGuidePanelProps {
  memberName: string;
  workerName: string;
  onOutcomeSelect?: (outcome: string) => void;
}

interface SectionState {
  introduction: boolean;
  checkIn: boolean;
  prayer: boolean;
  closing: boolean;
}

const talkingPoints = [
  'Confirm member identity and introduce yourself',
  'Ask how they are doing spiritually and personally',
  'Inquire about any prayer requests or needs',
  'Invite them to upcoming church events or services',
  'Offer to connect them with a small group or ministry',
  'Thank them for being part of the church family',
];

function getGreetingTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function CallGuidePanel({
  memberName,
  workerName,
  onOutcomeSelect,
}: CallGuidePanelProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [quickNotes, setQuickNotes] = useState('');
  const [sections, setSections] = useState<SectionState>({
    introduction: true,
    checkIn: false,
    prayer: false,
    closing: false,
  });

  const toggleSection = (key: keyof SectionState) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCheckItem = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const timeOfDay = getGreetingTimeOfDay();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Greeting script */}
        <div className="rounded-lg bg-indigo-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">
            Greeting Script
          </p>
          <p className="mt-2 text-sm italic text-indigo-900">
            &ldquo;Good {timeOfDay}, this is {workerName} from the church. Am I
            speaking with {memberName}?&rdquo;
          </p>
        </div>

        {/* Collapsible sections */}
        <CollapsibleSection
          title="Introduction"
          isOpen={sections.introduction}
          onToggle={() => toggleSection('introduction')}
        >
          <ul className="space-y-1 text-sm text-slate-600">
            <li>Briefly introduce yourself and your role</li>
            <li>Explain the purpose of the call (caring check-in)</li>
            <li>Let them know the call will only take a few minutes</li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection
          title="Check-in Questions"
          isOpen={sections.checkIn}
          onToggle={() => toggleSection('checkIn')}
        >
          <ul className="space-y-1 text-sm text-slate-600">
            <li>&ldquo;How have you been since we last connected?&rdquo;</li>
            <li>&ldquo;Have you been able to join any services recently?&rdquo;</li>
            <li>&ldquo;Is there anything the church can help you with?&rdquo;</li>
            <li>&ldquo;Are there any areas in your life where you need support?&rdquo;</li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection
          title="Prayer"
          isOpen={sections.prayer}
          onToggle={() => toggleSection('prayer')}
        >
          <ul className="space-y-1 text-sm text-slate-600">
            <li>Ask if they have any specific prayer requests</li>
            <li>Offer to pray with them over the phone</li>
            <li>Note any requests to share with the prayer team (with permission)</li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection
          title="Closing"
          isOpen={sections.closing}
          onToggle={() => toggleSection('closing')}
        >
          <ul className="space-y-1 text-sm text-slate-600">
            <li>Thank them for their time</li>
            <li>Remind them of upcoming services and events</li>
            <li>Let them know they can reach out anytime</li>
            <li>&ldquo;God bless you, and we look forward to seeing you soon!&rdquo;</li>
          </ul>
        </CollapsibleSection>

        {/* Talking points checklist */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Key Talking Points</p>
          <ul className="space-y-2">
            {talkingPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={checkedItems[index] ?? false}
                  onChange={() => toggleCheckItem(index)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span
                  className={cn(
                    'text-sm',
                    checkedItems[index]
                      ? 'text-slate-400 line-through'
                      : 'text-slate-600',
                  )}
                >
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick notes */}
        <div>
          <Textarea
            label="Quick Notes"
            placeholder="Jot down notes during the call..."
            rows={3}
            value={quickNotes}
            onChange={(e) => setQuickNotes(e.target.value)}
          />
        </div>

        {/* Outcome buttons */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Quick Outcome</p>
          <div className="flex flex-wrap gap-2">
            {OUTCOMES.map((outcome) => (
              <button
                key={outcome.value}
                type="button"
                onClick={() => onOutcomeSelect?.(outcome.value)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  outcome.color,
                  'hover:opacity-80',
                )}
              >
                {outcome.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------- */
/*        Collapsible Section         */
/* ---------------------------------- */

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="rounded-lg border border-slate-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 px-4 py-3">{children}</div>
      )}
    </div>
  );
}
