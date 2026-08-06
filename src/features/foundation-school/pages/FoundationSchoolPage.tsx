import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, GraduationCap, Users, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/formatters';
import { usePermission } from '@/hooks/usePermission';
import { foundationSchoolApi } from '../api/foundation-school.api';
import { CohortFormModal } from '../components/CohortFormModal';
import { getInstructorLabel } from '../lib/instructorLabel';
import type { CohortStatus } from '@/types/foundationSchool';

const STATUS_VARIANT: Record<CohortStatus, 'success' | 'info' | 'warning' | 'gray'> = {
  ACTIVE: 'success',
  COMPLETED: 'info',
  PLANNED: 'warning',
  CANCELLED: 'gray',
};

export function FoundationSchoolPage() {
  const navigate = useNavigate();
  // The route only requires foundation_school.view to reach this page;
  // creating a batch needs foundation_school.manage_cohorts on top of that.
  const canManageCohorts = usePermission('foundation_school.manage_cohorts');
  const [formOpen, setFormOpen] = useState(false);

  const cohortsQuery = useQuery({
    queryKey: ['foundation-school', 'cohorts'],
    queryFn: () => foundationSchoolApi.getCohorts().then((res) => res.data),
  });

  const cohorts = cohortsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Foundation School"
        description="Manage batches, enrollments, and 7-class progress tracking"
        actions={
          canManageCohorts ? (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
              New Batch
            </Button>
          ) : undefined
        }
      />

      {cohortsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : cohorts.length === 0 ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="No batches yet"
            description={
              canManageCohorts
                ? 'Create your first Foundation School batch to start enrolling members.'
                : 'No Foundation School batches have been created yet. Ask a Foundation School Teacher or Administrator to create one.'
            }
            action={
              canManageCohorts ? (
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                  New Batch
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cohorts.map((cohort) => (
            <Card
              key={cohort.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => navigate(`/foundation-school/${cohort.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-indigo-500" />
                    <CardTitle>{cohort.name}</CardTitle>
                  </div>
                  <Badge variant={STATUS_VARIANT[cohort.status]} dot>
                    {cohort.status.charAt(0) + cohort.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="h-3.5 w-3.5" /> Start Date
                    </span>
                    <span className="font-medium text-slate-700">{formatDate(cohort.startDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users className="h-3.5 w-3.5" /> Enrolled
                    </span>
                    <span className="font-medium text-slate-700">{cohort._count?.enrollments ?? 0} members</span>
                  </div>
                  {getInstructorLabel(cohort) && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Instructor</span>
                      <span className="font-medium text-slate-700">{getInstructorLabel(cohort)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CohortFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
