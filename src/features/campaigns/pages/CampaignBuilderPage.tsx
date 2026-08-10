import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, ChevronRight, Send, ShieldCheck, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { WYSIWYGEditor } from '../components/WYSIWYGEditor';
import { RecipientSelector } from '../components/RecipientSelector';
import { MediaLibrary } from '../components/MediaLibrary';
import { campaignsApi, lookupsApi } from '../api/campaigns.api';
import type { SegmentDefinition } from '@/types/campaign';

const steps = [
  { number: 1, label: 'Setup' },
  { number: 2, label: 'Content' },
  { number: 3, label: 'Recipients' },
  { number: 4, label: 'Review & Send' },
] as const;

interface FormData {
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  teamId: string;
  segment: SegmentDefinition;
}

const emptyForm: FormData = {
  name: '',
  subject: '',
  htmlContent: '',
  textContent: '',
  teamId: '',
  segment: {},
};

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                currentStep === step.number
                  ? 'bg-indigo-600 text-white'
                  : currentStep > step.number
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-slate-100 text-slate-400',
              )}
            >
              {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
            </div>
            <span
              className={cn(
                'mt-1.5 text-xs font-medium',
                currentStep === step.number
                  ? 'text-indigo-600'
                  : currentStep > step.number
                    ? 'text-slate-600'
                    : 'text-slate-400',
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn('mx-2 mb-6 h-0.5 w-12 sm:w-20', currentStep > step.number ? 'bg-indigo-300' : 'bg-slate-200')}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function CampaignBuilderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const canApprove = usePermission('campaigns.approve');
  const canSend = usePermission('campaigns.send');

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [campaignId, setCampaignId] = useState<string | undefined>(editId ?? undefined);
  const [hydrated, setHydrated] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [pendingImageInsert, setPendingImageInsert] = useState<((url: string) => void) | null>(null);

  const { data: campaign, isLoading: isLoadingCampaign } = useQuery({
    queryKey: ['campaigns', editId],
    queryFn: () => campaignsApi.getCampaign(editId as string).then((res) => res.data),
    enabled: Boolean(editId),
  });

  const { data: teams } = useQuery({
    queryKey: ['campaigns', 'lookups', 'teams'],
    queryFn: () => lookupsApi.getTeams().then((res) => res.data.data),
  });

  const { data: preview } = useQuery({
    queryKey: ['campaigns', campaignId, 'segment-preview', formData.segment],
    queryFn: () => campaignsApi.previewSegment(campaignId as string).then((res) => res.data),
    enabled: Boolean(campaignId) && currentStep === 4,
  });

  useEffect(() => {
    if (campaign && !hydrated) {
      let segment: SegmentDefinition = {};
      if (campaign.segmentDefinitionJson) {
        try {
          segment = JSON.parse(campaign.segmentDefinitionJson);
        } catch {
          segment = {};
        }
      }
      setFormData({
        name: campaign.name,
        subject: campaign.subject,
        htmlContent: campaign.htmlContent,
        textContent: campaign.textContent ?? '',
        teamId: campaign.teamId ?? '',
        segment,
      });
      setCampaignId(campaign.id);
      setHydrated(true);
    }
  }, [campaign, hydrated]);

  const invalidateCampaign = () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      campaignsApi.createCampaign({
        name: formData.name,
        subject: formData.subject,
        htmlContent: formData.htmlContent,
        textContent: formData.textContent || undefined,
        teamId: formData.teamId || undefined,
      }),
    onSuccess: (res) => {
      setCampaignId(res.data.id);
      invalidateCampaign();
      setCurrentStep(3);
    },
    onError: (error: any) => {
      toast({ title: 'Could not save campaign', description: error?.response?.data?.message, variant: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof campaignsApi.updateCampaign>[1]) =>
      campaignsApi.updateCampaign(campaignId as string, data),
    onSuccess: () => invalidateCampaign(),
    onError: (error: any) => {
      toast({ title: 'Could not save changes', description: error?.response?.data?.message, variant: 'error' });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => campaignsApi.approveCampaign(campaignId as string),
    onSuccess: () => {
      toast({ title: 'Campaign approved', variant: 'success' });
      invalidateCampaign();
      queryClient.invalidateQueries({ queryKey: ['campaigns', editId] });
    },
    onError: (error: any) => {
      toast({ title: 'Could not approve campaign', description: error?.response?.data?.message, variant: 'error' });
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => campaignsApi.sendCampaign(campaignId as string),
    onSuccess: () => {
      toast({ title: 'Campaign sent', variant: 'success' });
      invalidateCampaign();
      navigate(`/campaigns/${campaignId}/analytics`);
    },
    onError: (error: any) => {
      toast({ title: 'Could not send campaign', description: error?.response?.data?.message, variant: 'error' });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: () => campaignsApi.scheduleCampaign(campaignId as string, new Date(scheduledDate).toISOString()),
    onSuccess: () => {
      toast({ title: 'Campaign scheduled', variant: 'success' });
      invalidateCampaign();
      navigate(`/campaigns/${campaignId}/analytics`);
    },
    onError: (error: any) => {
      toast({ title: 'Could not schedule campaign', description: error?.response?.data?.message, variant: 'error' });
    },
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function handleNext() {
    if (currentStep === 1) {
      if (!formData.name.trim() || !formData.subject.trim()) {
        toast({ title: 'Name and subject are required', variant: 'warning' });
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!formData.htmlContent.trim()) {
        toast({ title: 'Message content is required', variant: 'warning' });
        return;
      }
      if (!campaignId) {
        createMutation.mutate();
      } else {
        updateMutation.mutate(
          {
            name: formData.name,
            subject: formData.subject,
            htmlContent: formData.htmlContent,
            textContent: formData.textContent || undefined,
            teamId: formData.teamId || undefined,
          },
          { onSuccess: () => setCurrentStep(3) },
        );
      }
      return;
    }

    if (currentStep === 3) {
      updateMutation.mutate(
        { segmentDefinitionJson: formData.segment },
        { onSuccess: () => setCurrentStep(4) },
      );
      return;
    }
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  }

  const teamOptions = (teams ?? []).map((t) => ({ label: t.name, value: t.id }));
  const isApproved = Boolean(campaign?.approvedById) || approveMutation.isSuccess;
  const isEditingLocked = Boolean(campaign) && campaign!.status !== 'DRAFT';

  if (editId && isLoadingCampaign) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (isEditingLocked) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Campaign"
          breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Edit' }]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-slate-600">
              This campaign is <strong>{campaign?.status}</strong> and can no longer be edited. Only draft
              campaigns can be changed.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => navigate(`/campaigns/${campaign?.id}/analytics`)}>
              View Campaign
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={editId ? 'Edit Campaign' : 'Create Campaign'}
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: editId ? 'Edit' : 'New' }]}
      />

      <StepIndicator currentStep={currentStep} />

      <Card>
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle>Campaign Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-lg space-y-4">
                <Input
                  label="Campaign Name"
                  placeholder="e.g., Easter Sunday Reminder"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
                <Input
                  label="Subject Line"
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                />
                <Select
                  label="Team (optional)"
                  placeholder="No specific team"
                  options={teamOptions}
                  value={formData.teamId}
                  onChange={(e) => updateField('teamId', e.target.value)}
                />
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle>Campaign Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">HTML Content</label>
                  <WYSIWYGEditor
                    content={formData.htmlContent}
                    onChange={(html) => updateField('htmlContent', html)}
                    onInsertImage={(insert) => {
                      setPendingImageInsert(() => insert);
                      setImagePickerOpen(true);
                    }}
                  />
                  <p className="text-xs text-slate-400">
                    Compose your message using the editor above. You can format text, add links, and insert
                    images from the media library.
                  </p>
                </div>

                {imagePickerOpen && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">Select an image to insert</p>
                      <button
                        type="button"
                        className="text-xs font-medium text-slate-500 hover:text-slate-700"
                        onClick={() => setImagePickerOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                    <MediaLibrary
                      onSelect={(url) => {
                        pendingImageInsert?.(url);
                        setImagePickerOpen(false);
                      }}
                    />
                  </div>
                )}

                <Input
                  label="Plain-text version (optional)"
                  placeholder="Fallback text content for email clients that don't render HTML"
                  value={formData.textContent}
                  onChange={(e) => updateField('textContent', e.target.value)}
                />
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle>Select Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <RecipientSelector
                value={formData.segment}
                onChange={(segment) => updateField('segment', segment)}
                campaignId={campaignId}
              />
            </CardContent>
          </>
        )}

        {currentStep === 4 && (
          <>
            <CardHeader>
              <CardTitle>Review &amp; Send</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">Campaign Summary</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Name</dt>
                      <dd className="font-medium text-slate-900">{formData.name || 'Not set'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Subject</dt>
                      <dd className="font-medium text-slate-900">{formData.subject || 'Not set'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Estimated Recipients</dt>
                      <dd className="font-medium text-slate-900">
                        {preview ? preview.estimatedRecipients.toLocaleString() : '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Approval Status</dt>
                      <dd className="font-medium text-slate-900">{isApproved ? 'Approved' : 'Pending approval'}</dd>
                    </div>
                  </dl>
                </div>

                {formData.htmlContent && (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-slate-900">Content Preview</h4>
                    <div
                      className="prose prose-sm max-w-none text-slate-700"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(formData.htmlContent) }}
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  {!isApproved && canApprove && (
                    <Button
                      variant="outline"
                      leftIcon={<ShieldCheck className="h-4 w-4" />}
                      isLoading={approveMutation.isPending}
                      onClick={() => approveMutation.mutate()}
                    >
                      Approve Campaign
                    </Button>
                  )}

                  {isApproved && canSend && (
                    <Button
                      leftIcon={<Send className="h-4 w-4" />}
                      isLoading={sendMutation.isPending}
                      onClick={() => sendMutation.mutate()}
                    >
                      Send Now
                    </Button>
                  )}

                  {isApproved && canSend && (
                    <div className="flex items-center gap-2">
                      <DatePicker value={scheduledDate} onChange={setScheduledDate} />
                      <Button
                        variant="outline"
                        leftIcon={<CalendarClock className="h-4 w-4" />}
                        isLoading={scheduleMutation.isPending}
                        disabled={!scheduledDate}
                        onClick={() => scheduleMutation.mutate()}
                      >
                        Schedule
                      </Button>
                    </div>
                  )}
                </div>
                {!canApprove && !isApproved && (
                  <p className="text-xs text-slate-400">
                    You don&apos;t have permission to approve campaigns. Ask an approver to review this draft.
                  </p>
                )}
              </div>
            </CardContent>
          </>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={handleBack} disabled={currentStep === 1}>
          Back
        </Button>

        {currentStep < 4 && (
          <Button rightIcon={<ChevronRight className="h-4 w-4" />} isLoading={isSaving} onClick={handleNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
