import { Plus, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface CallGuide {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  steps: number;
}

const mockGuides: CallGuide[] = [
  {
    id: '1',
    title: 'New Member Follow-Up',
    description:
      'Guide for welcoming and connecting with new members who visited for the first time',
    lastUpdated: '2 weeks ago',
    steps: 12,
  },
  {
    id: '2',
    title: 'Absentee Follow-Up',
    description:
      'Reaching out to members who have been absent for 2+ weeks',
    lastUpdated: '1 month ago',
    steps: 8,
  },
  {
    id: '3',
    title: 'Post-Event Follow-Up',
    description:
      'Following up with attendees after special church events and programs',
    lastUpdated: '3 weeks ago',
    steps: 10,
  },
  {
    id: '4',
    title: 'General Check-in',
    description:
      'Regular wellness check-in calls for all church members',
    lastUpdated: '1 week ago',
    steps: 6,
  },
];

export function CallGuideListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Guides"
        actions={
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Create Guide
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {mockGuides.map((guide) => (
          <Card key={guide.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-base">{guide.title}</CardTitle>
              </div>
              <Badge variant="info">{guide.steps} steps</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{guide.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Last updated: {guide.lastUpdated}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Edit guide: ${guide.title}`)}
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
