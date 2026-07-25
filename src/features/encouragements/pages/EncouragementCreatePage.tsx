import { useState } from 'react';
import { Clock, Lightbulb, MessageSquare, BookOpen, CalendarClock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { cn } from '@/lib/cn';
import { PastorQuickSend } from '../components/PastorQuickSend';

type SendTiming = 'now' | 'scheduled';

const TIPS = [
  {
    icon: <MessageSquare className="h-4 w-4" />,
    title: 'Keep messages concise',
    description: 'Under 160 characters for SMS to avoid splitting into multiple messages.',
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
  const [sendTiming, setSendTiming] = useState<SendTiming>('now');
  const [scheduledDate, setScheduledDate] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Send Encouragement"
        subtitle="Encouragements > New"
        breadcrumbs={[
          { label: 'Encouragements', href: '/encouragements' },
          { label: 'New' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: Quick Send form */}
        <div className="space-y-6">
          <PastorQuickSend />

          {/* Schedule option */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-all',
                      sendTiming === 'now'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="sendTiming"
                      value="now"
                      checked={sendTiming === 'now'}
                      onChange={() => setSendTiming('now')}
                      className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        sendTiming === 'now' ? 'text-indigo-900' : 'text-slate-700',
                      )}
                    >
                      Send Now
                    </span>
                  </label>

                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-all',
                      sendTiming === 'scheduled'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="sendTiming"
                      value="scheduled"
                      checked={sendTiming === 'scheduled'}
                      onChange={() => setSendTiming('scheduled')}
                      className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        sendTiming === 'scheduled' ? 'text-indigo-900' : 'text-slate-700',
                      )}
                    >
                      Schedule for Later
                    </span>
                  </label>
                </div>

                {sendTiming === 'scheduled' && (
                  <DatePicker
                    label="Scheduled Date"
                    value={scheduledDate}
                    onChange={setScheduledDate}
                    min={new Date().toISOString().split('T')[0]}
                    helpText="The encouragement will be sent at 8:00 AM on the selected date"
                  />
                )}
              </div>
            </CardContent>
          </Card>
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
                      <h4 className="text-sm font-medium text-slate-900">
                        {tip.title}
                      </h4>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {tip.description}
                      </p>
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
