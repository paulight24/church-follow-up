import { Clock, Lightbulb, MessageSquare, BookOpen, CalendarClock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PastorQuickSend } from '../components/PastorQuickSend';

const TIPS = [
  {
    icon: <MessageSquare className="h-4 w-4" />,
    title: 'Keep messages concise',
    description: 'Short, warm messages are read in full and land better than long ones.',
  },
  {
    icon: <BookOpen className="h-4 w-4" />,
    title: 'Include scripture',
    description: 'Scripture references add spiritual depth and encouragement to your messages.',
  },
  {
    icon: <Clock className="h-4 w-4" />,
    title: 'Optimal delivery times',
    description: 'Schedule for early mornings (6-8 AM) or evenings (6-8 PM) for best engagement.',
  },
  {
    icon: <Lightbulb className="h-4 w-4" />,
    title: 'Personalize when possible',
    description: 'Use audience targeting to send relevant messages to specific groups.',
  },
  {
    icon: <CalendarClock className="h-4 w-4" />,
    title: 'Plan ahead',
    description: 'Schedule messages for holidays, birthdays, and special church events in advance.',
  },
];

export function EncouragementCreatePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Send Encouragement"
        subtitle="Encouragements > New"
        breadcrumbs={[{ label: 'Encouragements', href: '/encouragements' }, { label: 'New' }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: Quick Send form (handles both immediate send and scheduling) */}
        <div className="space-y-6">
          <PastorQuickSend />
        </div>

        {/* Right column: Tips and guidelines */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tips &amp; Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {TIPS.map((tip) => (
                  <div key={tip.title} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      {tip.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900">{tip.title}</h4>
                      <p className="mt-0.5 text-sm text-slate-500">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
