import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export function CohortDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohort Details"
        description="Foundation School > Cohort"
      />

      <Card>
        <CardContent className="flex flex-col items-center py-16">
          <GraduationCap className="mb-4 h-16 w-16 text-slate-300" />
          <h2 className="mb-2 text-xl font-semibold text-slate-900">
            Cohort Details Coming Soon
          </h2>
          <p className="mb-6 max-w-md text-center text-sm text-slate-500">
            This page will allow you to track student progress, manage attendance,
            view lesson completion, and monitor overall cohort performance in
            the Foundation School program.
          </p>
          <Button variant="outline" onClick={() => navigate('/foundation-school')}>
            Back to Foundation School
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
