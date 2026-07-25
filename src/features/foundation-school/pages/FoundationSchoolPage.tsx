import { useState } from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Cohort {
  id: string;
  name: string;
  startDate: string;
  studentCount: number;
  status: 'Active' | 'Completed' | 'Upcoming';
  progress: number;
}

const statusVariant: Record<Cohort['status'], 'success' | 'info' | 'warning'> = {
  Active: 'success',
  Completed: 'info',
  Upcoming: 'warning',
};

const MOCK_COHORTS: Cohort[] = [
  {
    id: '1',
    name: 'April 2026 Cohort',
    startDate: 'Apr 1, 2026',
    studentCount: 32,
    status: 'Active',
    progress: 65,
  },
  {
    id: '2',
    name: 'January 2026 Cohort',
    startDate: 'Jan 15, 2026',
    studentCount: 28,
    status: 'Completed',
    progress: 100,
  },
  {
    id: '3',
    name: 'July 2026 Cohort',
    startDate: 'Jul 1, 2026',
    studentCount: 15,
    status: 'Upcoming',
    progress: 0,
  },
];

export function FoundationSchoolPage() {
  const [cohorts] = useState(MOCK_COHORTS);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Foundation School"
        actions={
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => alert('New cohort form coming soon')}
          >
            New Cohort
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cohorts.map((cohort) => (
          <Card
            key={cohort.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => alert('Cohort details coming soon')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-indigo-500" />
                  <CardTitle>{cohort.name}</CardTitle>
                </div>
                <Badge variant={statusVariant[cohort.status]} dot>
                  {cohort.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Start Date</span>
                  <span className="font-medium text-slate-700">{cohort.startDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Students</span>
                  <span className="font-medium text-slate-700">
                    {cohort.studentCount} {cohort.status === 'Upcoming' ? 'registered' : 'students'}
                  </span>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-medium text-slate-700">{cohort.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${cohort.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
