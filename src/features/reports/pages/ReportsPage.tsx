import { useState } from 'react';
import {
  ClipboardList,
  Users,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

const REPORT_CARDS: ReportCard[] = [
  {
    id: 'follow-up',
    title: 'Follow-Up Summary',
    description: 'Overview of follow-up activities, completion rates, and outcomes',
    icon: <ClipboardList className="mb-3 h-10 w-10 text-indigo-500" />,
  },
  {
    id: 'team-performance',
    title: 'Team Performance',
    description: 'Team productivity metrics, response times, and success rates',
    icon: <Users className="mb-3 h-10 w-10 text-indigo-500" />,
  },
  {
    id: 'member-growth',
    title: 'Member Growth',
    description: 'New member registrations, retention rates, and growth trends',
    icon: <TrendingUp className="mb-3 h-10 w-10 text-indigo-500" />,
  },
  {
    id: 'attendance',
    title: 'Attendance Trends',
    description: 'Service attendance patterns and seasonal comparisons',
    icon: <BarChart3 className="mb-3 h-10 w-10 text-indigo-500" />,
  },
  {
    id: 'escalations',
    title: 'Escalation Analysis',
    description: 'Escalation types, resolution times, and recurring patterns',
    icon: <AlertTriangle className="mb-3 h-10 w-10 text-indigo-500" />,
  },
  {
    id: 'communications',
    title: 'Communication Report',
    description: 'Campaign delivery rates, engagement metrics, and channel performance',
    icon: <MessageSquare className="mb-3 h-10 w-10 text-indigo-500" />,
  },
];

export function ReportsPage() {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and view ministry reports"
      />

      {showAlert && (
        <Alert variant="success" onDismiss={() => setShowAlert(false)}>
          Report generation coming soon. This feature is under development.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {REPORT_CARDS.map((report) => (
          <Card key={report.id}>
            <CardContent className="flex flex-col">
              {report.icon}
              <CardTitle className="mb-2">{report.title}</CardTitle>
              <p className="mb-4 flex-1 text-sm text-slate-500">
                {report.description}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAlert(true)}
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
