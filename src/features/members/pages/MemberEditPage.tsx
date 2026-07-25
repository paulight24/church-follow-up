import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { MemberForm } from '@/features/members/components/MemberForm';
import type { MemberFormValues } from '@/features/members/components/MemberForm';
import { membersApi } from '@/features/members/api/members.api';
import type { UpdateMemberRequest } from '@/types/member';
import type { ApiError } from '@/types';

function toUpdateRequest(values: MemberFormValues): UpdateMemberRequest {
  const payload: UpdateMemberRequest = {
    firstName: values.firstName,
    lastName: values.lastName,
  };

  if (values.middleName) payload.middleName = values.middleName;
  if (values.preferredName) payload.preferredName = values.preferredName;
  if (values.gender) payload.gender = values.gender as UpdateMemberRequest['gender'];
  if (values.maritalStatus) payload.maritalStatus = values.maritalStatus as UpdateMemberRequest['maritalStatus'];
  if (values.dateOfBirth) payload.dateOfBirth = values.dateOfBirth;
  if (values.email) payload.email = values.email;
  if (values.phonePrimary) payload.phonePrimary = values.phonePrimary;
  if (values.phoneSecondary) payload.phoneSecondary = values.phoneSecondary;
  if (values.preferredContactMethod) {
    payload.preferredContactMethod = values.preferredContactMethod as UpdateMemberRequest['preferredContactMethod'];
  }
  if (values.preferredLanguage) payload.preferredLanguage = values.preferredLanguage;
  if (values.departmentId) payload.departmentId = values.departmentId;
  if (values.fellowshipGroupId) payload.fellowshipGroupId = values.fellowshipGroupId;
  if (values.lastAttendanceDate) payload.lastAttendanceDate = values.lastAttendanceDate;
  if (values.source) payload.source = values.source as UpdateMemberRequest['source'];
  if (values.isFirstTimer != null) payload.isFirstTimer = values.isFirstTimer;
  if (values.firstVisitDate) payload.firstVisitDate = values.firstVisitDate;
  if (values.bornAgainStatus) payload.bornAgainStatus = values.bornAgainStatus;
  if (values.inviterName) payload.inviterName = values.inviterName;
  if (values.inviterPhone) payload.inviterPhone = values.inviterPhone;
  if (values.visitorJourneyStage) {
    payload.visitorJourneyStage = values.visitorJourneyStage as UpdateMemberRequest['visitorJourneyStage'];
  }
  if (values.communicationConsentEmail != null) payload.communicationConsentEmail = values.communicationConsentEmail;
  if (values.communicationConsentSms != null) payload.communicationConsentSms = values.communicationConsentSms;
  if (values.doNotContact != null) payload.doNotContact = values.doNotContact;
  if (values.generalNotes) payload.generalNotes = values.generalNotes;
  if (values.pastoralNotes) payload.pastoralNotes = values.pastoralNotes;

  return payload;
}

export function MemberEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: member, isLoading } = useQuery({
    queryKey: ['members', id],
    queryFn: () => membersApi.getMember(id!).then((res) => res.data),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMemberRequest) => membersApi.updateMember(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      navigate(`/members/${id}`);
    },
  });

  const handleSubmit = (values: MemberFormValues) => {
    updateMutation.mutate(toUpdateRequest(values));
  };

  const errorMessage = (updateMutation.error as { response?: { data?: ApiError } } | undefined)?.response
    ?.data?.message;

  const displayName = member ? `${member.firstName} ${member.lastName}` : 'Member';

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/members" className="hover:text-indigo-600">
          Members
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/members/${id}`} className="hover:text-indigo-600">
          {displayName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">Edit</span>
      </nav>

      <PageHeader title={`Edit ${displayName}`} />

      {updateMutation.isError && (
        <Alert variant="error" title="Failed to update member">
          {errorMessage ?? 'Please check the form and try again.'}
        </Alert>
      )}

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" className="text-indigo-600" />
            </div>
          ) : (
            <MemberForm
              initialData={member}
              onSubmit={handleSubmit}
              isSubmitting={updateMutation.isPending}
              onCancel={() => navigate(`/members/${id}`)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
