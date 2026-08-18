import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Info, Lock, ShieldCheck, UserCircle2, HeartHandshake } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import type { UpdateMyProfileRequest } from '@/types/profile';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/formatters';
import { profileApi } from '../api/profile.api';
import { ProfileForm } from '../components/ProfileForm';
import type { ProfileFormValues } from '../components/ProfileForm';

/** Builds the PATCH body from form values, only including keys the backend
 * whitelists and skipping ones the user left blank (mirrors the same
 * "only send what's set" convention used by MemberForm/MemberEditPage). */
function toUpdateRequest(values: ProfileFormValues): UpdateMyProfileRequest {
  const payload: UpdateMyProfileRequest = {};
  if (values.preferredName) payload.preferredName = values.preferredName;
  if (values.phonePrimary) payload.phonePrimary = values.phonePrimary;
  if (values.phoneSecondary) payload.phoneSecondary = values.phoneSecondary;
  if (values.email) payload.email = values.email;
  if (values.dateOfBirth) payload.dateOfBirth = values.dateOfBirth;
  if (values.weddingAnniversary) payload.weddingAnniversary = values.weddingAnniversary;
  // Always send this one (unlike the string fields above) so explicitly turning
  // consent OFF is actually saved instead of being treated as "left blank".
  payload.communicationConsentWhatsapp = values.communicationConsentWhatsapp ?? false;
  return payload;
}

export function ProfilePage() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const canEdit = hasPermission('profile.update_own');

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.getMyProfile().then((res) => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMyProfileRequest) => profileApi.updateMyProfile(data),
    onSuccess: () => {
      toast({ title: 'Profile updated', variant: 'success' });
      setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: (error: AxiosError<ApiError>) => {
      setSubmitError(error.response?.data?.message ?? 'Could not save your changes. Please try again.');
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Profile" subtitle="Your account and contact details" />
        <Alert variant="error">Could not load your profile. Please try again shortly.</Alert>
      </div>
    );
  }

  const accountName = `${profile.firstName} ${profile.lastName}`;
  const member = profile.member;

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Your account and contact details" />

      {/* Account (read-only) */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={profile.avatarUrl ?? undefined} name={accountName} size="lg" />
            <div>
              <p className="font-semibold text-slate-900">{accountName}</p>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(profile.roles ?? []).length === 0 ? (
              <span className="text-xs text-slate-400">No roles assigned</span>
            ) : (
              (profile.roles ?? []).map((r) => (
                <Badge key={r.id} variant="default" size="sm">
                  {r.name}
                </Badge>
              ))
            )}
            {profile.status && (
              <Badge variant={profile.status === 'ACTIVE' ? 'success' : 'gray'} dot size="sm">
                {profile.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Who is walking with this member - shown only when an active
          follow-up assignment exists, so staff accounts and unassigned
          members simply never see the card. */}
      {profile.followUp && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-slate-400" />
            <CardTitle className="text-base">Your follow-up contact</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Avatar
              src={profile.followUp.primaryWorker.avatarUrl ?? undefined}
              name={profile.followUp.primaryWorker.name}
              size="lg"
            />
            <div>
              <p className="font-semibold text-slate-900">{profile.followUp.primaryWorker.name}</p>
              <p className="text-sm text-slate-500">
                {profile.followUp.teamName}
                {profile.followUp.backupWorker ? ` · with ${profile.followUp.backupWorker.name}` : ''}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Here to walk with you — they may reach out by phone, text, or email.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Member record */}
      {member === null ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Info}
              title="No member profile linked yet"
              description="Your account isn't linked to a member record, so there's nothing to edit here yet. Ask your church admin to link your account to your member record — once that's done, your contact details will appear on this page."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Lock className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-base">Pastoral details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-500">
                These fields are managed by your pastoral team, not by you — reach out to your leader or
                cell group if any of this looks out of date.
              </p>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Membership status
                  </dt>
                  <dd className="mt-1">
                    {member.membershipStatus ? (
                      <Badge variant="info" size="sm">
                        {member.membershipStatus.name}
                      </Badge>
                    ) : (
                      <span className="text-sm text-slate-400">Not set</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Journey stage
                  </dt>
                  <dd className="mt-1 text-sm text-slate-700">
                    {member.visitorJourneyStage
                      ? member.visitorJourneyStage.replace(/_/g, ' ').toLowerCase()
                      : <span className="text-slate-400">Not set</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Department</dt>
                  <dd className="mt-1 text-sm text-slate-700">
                    {member.department?.name ?? <span className="text-slate-400">Not assigned</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Cell group</dt>
                  <dd className="mt-1 text-sm text-slate-700">
                    {member.fellowshipGroup?.name ?? <span className="text-slate-400">Not assigned</span>}
                  </dd>
                </div>
              </dl>
              {member.lastAttendanceDate && (
                <p className="mt-4 text-xs text-slate-400">
                  Last attendance recorded {formatDate(member.lastAttendanceDate)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <UserCircle2 className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-base">Your contact details</CardTitle>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <>
                  <p className="mb-4 text-sm text-slate-500">
                    You can update these yourself at any time.
                  </p>
                  {submitError && (
                    <div className="mb-4">
                      <Alert variant="error">{submitError}</Alert>
                    </div>
                  )}
                  <ProfileForm
                    member={member}
                    onSubmit={(values) => {
                      setSubmitError(null);
                      updateMutation.mutate(toUpdateRequest(values));
                    }}
                    isSubmitting={updateMutation.isPending}
                  />
                </>
              ) : (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Preferred name
                    </dt>
                    <dd className="mt-1 text-sm text-slate-700">{member.preferredName ?? '--'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</dt>
                    <dd className="mt-1 text-sm text-slate-700">{member.email ?? '--'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Primary phone
                    </dt>
                    <dd className="mt-1 text-sm text-slate-700">{member.phonePrimary ?? '--'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Secondary phone
                    </dt>
                    <dd className="mt-1 text-sm text-slate-700">{member.phoneSecondary ?? '--'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      WhatsApp messages
                    </dt>
                    <dd className="mt-1">
                      <Badge variant={member.communicationConsentWhatsapp ? 'success' : 'gray'} size="sm">
                        {member.communicationConsentWhatsapp ? 'Opted in' : 'Opted out'}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
