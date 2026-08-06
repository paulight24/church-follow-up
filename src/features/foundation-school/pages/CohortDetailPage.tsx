import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, GraduationCap, UserPlus, Award } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/lib/formatters';
import { foundationSchoolApi } from '../api/foundation-school.api';
import { EnrollMemberModal } from '../components/EnrollMemberModal';
import { ClassProgressCell } from '../components/ClassProgressCell';
import { getInstructorLabel } from '../lib/instructorLabel';
import { TOTAL_FOUNDATION_SCHOOL_CLASSES, type EnrollmentStatus } from '@/types/foundationSchool';

const ENROLLMENT_STATUS_VARIANT: Record<EnrollmentStatus, 'gray' | 'info' | 'success' | 'danger'> = {
  ENROLLED: 'gray',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  DROPPED: 'danger',
};

export function CohortDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // The route only requires foundation_school.view to reach this page;
  // enrolling and graduating a member each need their own permission.
  const canEnroll = usePermission('foundation_school.enroll');
  const canGraduate = usePermission('foundation_school.graduate');
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  const cohortQuery = useQuery({
    queryKey: ['foundation-school', 'cohorts', id],
    queryFn: () => foundationSchoolApi.getCohort(id!).then((res) => res.data),
    enabled: !!id,
  });

  const enrollmentsQuery = useQuery({
    queryKey: ['foundation-school', 'enrollments', { cohortId: id }],
    queryFn: () => foundationSchoolApi.getEnrollments({ cohortId: id, pageSize: 100 }).then((res) => res.data),
    enabled: !!id,
  });

  const graduateMutation = useMutation({
    mutationFn: (enrollmentId: string) => foundationSchoolApi.graduateEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foundation-school'] });
      toast({ title: 'Member graduated', variant: 'success' });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to graduate member';
      toast({ title: 'Error', description: message, variant: 'error' });
    },
  });

  const cohort = cohortQuery.data;
  const enrollments = enrollmentsQuery.data?.data ?? [];
  const instructorLabel = cohort ? getInstructorLabel(cohort) : null;

  if (cohortQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (!cohort) {
    return (
      <Card>
        <EmptyState icon={GraduationCap} title="Batch not found" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/foundation-school" className="hover:text-indigo-600">
          Foundation School
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">{cohort.name}</span>
      </nav>

      <PageHeader
        title={cohort.name}
        subtitle={`Started ${formatDate(cohort.startDate)}${instructorLabel ? ` - ${instructorLabel}` : ''}`}
        actions={
          canEnroll ? (
            <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setEnrollModalOpen(true)}>
              Enroll Member
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-slate-900">{enrollments.length}</p>
            <p className="text-sm text-slate-500">Enrolled Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-slate-900">
              {enrollments.filter((e) => e.status === 'COMPLETED').length}
            </p>
            <p className="text-sm text-slate-500">Graduated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-slate-900">
              {enrollments.filter((e) => e.status === 'IN_PROGRESS').length}
            </p>
            <p className="text-sm text-slate-500">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-slate-900">
              {cohort.graduationDate ? formatDate(cohort.graduationDate) : '--'}
            </p>
            <p className="text-sm text-slate-500">Graduation Date</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Certificate</TableHead>
              <TableHead>Classes 1 - 7</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollmentsQuery.isLoading ? (
              <TableEmpty colSpan={5} message="Loading enrollments..." />
            ) : enrollments.length === 0 ? (
              <TableEmpty
                colSpan={5}
                icon={<GraduationCap className="h-8 w-8" />}
                message="No members enrolled in this batch yet."
              />
            ) : (
              enrollments.map((enrollment) => {
                const completedClasses = enrollment.classProgress.filter((c) => c.status === 'COMPLETED').length;
                const eligible =
                  completedClasses === TOTAL_FOUNDATION_SCHOOL_CLASSES && enrollment.status !== 'COMPLETED';
                return (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium text-slate-900">
                      {enrollment.member.firstName} {enrollment.member.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ENROLLMENT_STATUS_VARIANT[enrollment.status]} dot>
                        {enrollment.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-500">{enrollment.certificateStatus.replace(/_/g, ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        {[...enrollment.classProgress]
                          .sort((a, b) => a.classNumber - b.classNumber)
                          .map((progress) => (
                            <ClassProgressCell key={progress.id} progress={progress} />
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {enrollment.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <Award className="h-3.5 w-3.5" /> Graduated
                        </span>
                      ) : canGraduate ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!eligible}
                          title={
                            eligible
                              ? 'All 7 classes completed - ready to graduate'
                              : `${completedClasses}/${TOTAL_FOUNDATION_SCHOOL_CLASSES} classes completed`
                          }
                          isLoading={graduateMutation.isPending}
                          leftIcon={<Award className="h-3.5 w-3.5" />}
                          onClick={() => graduateMutation.mutate(enrollment.id)}
                        >
                          Graduate
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {id && (
        <EnrollMemberModal isOpen={enrollModalOpen} onClose={() => setEnrollModalOpen(false)} cohortId={id} />
      )}
    </div>
  );
}
