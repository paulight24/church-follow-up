import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { MemberForm } from '@/features/members/components/MemberForm';
import type { MemberFormValues } from '@/features/members/components/MemberForm';
import { membersApi } from '@/features/members/api/members.api';
import type { CreateMemberRequest } from '@/types/member';
import type { ApiError } from '@/types';

function toCreateRequest(values: MemberFormValues): CreateMemberRequest {
  const payload: CreateMemberRequest = {
    firstName: values.firstName,
    lastName: values.lastName,
  };

  if (values.middleName) payload.middleName = values.middleName;
  if (values.preferredName) payload.preferredName = values.preferredName;
  if (values.gender) payload.gender = values.gender as CreateMemberRequest['gender'];
  if (values.maritalStatus) payload.maritalStatus = values.maritalStatus as CreateMemberRequest['maritalStatus'];
  if (values.dateOfBirth) payload.dateOfBirth = values.dateOfBirth;
  if (values.weddingAnniversary) payload.weddingAnniversary = values.weddingAnniversary;
  if (values.email) payload.email = values.email;
  if (values.phonePrimary) payload.phonePrimary = values.phonePrimary;
  if (values.phoneSecondary) payload.phoneSecondary = values.phoneSecondary;
  if (values.preferredContactMethod) {
    payload.preferredContactMethod = values.preferredContactMethod as CreateMemberRequest['preferredContactMethod'];
  }
  if (values.preferredLanguage) payload.preferredLanguage = values.preferredLanguage;
  if (values.departmentId) payload.departmentId = values.departmentId;
  if (values.fellowshipGroupId) payload.fellowshipGroupId = values.fellowshipGroupId;
  if (values.lastAttendanceDate) payload.lastAttendanceDate = values.lastAttendanceDate;
  if (values.source) payload.source = values.source as CreateMemberRequest['source'];
  if (values.isFirstTimer) payload.isFirstTimer = values.isFirstTimer;
  if (values.firstVisitDate) payload.firstVisitDate = values.firstVisitDate;
  if (values.bornAgainStatus) payload.bornAgainStatus = values.bornAgainStatus;
  if (values.inviterName) payload.inviterName = values.inviterName;
  if (values.inviterPhone) payload.inviterPhone = values.inviterPhone;
  if (values.visitorJourneyStage) {
    payload.visitorJourneyStage = values.visitorJourneyStage as CreateMemberRequest['visitorJourneyStage'];
  }
  if (values.communicationConsentEmail != null) payload.communicationConsentEmail = values.communicationConsentEmail;
  if (values.communicationConsentSms != null) payload.communicationConsentSms = values.communicationConsentSms;
  if (values.doNotContact != null) payload.doNotContact = values.doNotContact;
  if (values.generalNotes) payload.generalNotes = values.generalNotes;
  if (values.pastoralNotes) payload.pastoralNotes = values.pastoralNotes;

  return payload;
}

export function MemberCreatePage() {
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: (data: CreateMemberRequest) => membersApi.createMember(data),
    onSuccess: (res) => {
      navigate(`/members/${res.data.id}`);
    },
  });

  const handleSubmit = (values: MemberFormValues) => {
    createMutation.mutate(toCreateRequest(values));
  };

  const errorMessage = (createMutation.error as { response?: { data?: ApiError } } | undefined)?.response
    ?.data?.message;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/members" className="hover:text-indigo-600">
          Members
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">New Member</span>
      </nav>

      <PageHeader title="Add New Member" />

      {createMutation.isError && (
        <Alert variant="error" title="Failed to create member">
          {errorMessage ?? 'Please check the form and try again.'}
        </Alert>
      )}

      <Card>
        <CardContent>
          <MemberForm
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
            onCancel={() => navigate('/members')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
