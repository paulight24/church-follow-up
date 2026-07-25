import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { WYSIWYGEditor } from '../components/WYSIWYGEditor';
import { RecipientSelector } from '../components/RecipientSelector';

const steps = [
  { number: 1, label: 'Setup' },
  { number: 2, label: 'Content' },
  { number: 3, label: 'Recipients' },
  { number: 4, label: 'Review & Send' },
] as const;

const channelOptions = [
  { label: 'SMS', value: 'SMS' },
  { label: 'WhatsApp', value: 'WHATSAPP' },
  { label: 'Email', value: 'EMAIL' },
];

interface FormData {
  name: string;
  channel: string;
  subject: string;
  content: string;
  recipientType: string;
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step circle */}
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
              {currentStep > step.number ? (
                <Check className="h-4 w-4" />
              ) : (
                step.number
              )}
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

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'mx-2 mb-6 h-0.5 w-12 sm:w-20',
                currentStep > step.number
                  ? 'bg-indigo-300'
                  : 'bg-slate-200',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function CampaignBuilderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    channel: '',
    subject: '',
    content: '',
    recipientType: 'all',
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSend = () => {
    alert('Campaign sent! (mock)');
  };

  const recipientLabel =
    formData.recipientType === 'all'
      ? 'All Members'
      : formData.recipientType === 'by-team'
        ? 'By Team'
        : formData.recipientType === 'by-status'
          ? 'By Status'
          : 'Custom List';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Campaign"
        breadcrumbs={[
          { label: 'Escalations', href: '/escalations' },
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'New' },
        ]}
      />

      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Step content */}
      <Card>
        {/* Step 1: Setup */}
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
                <Select
                  label="Channel"
                  placeholder="Select channel"
                  options={channelOptions}
                  value={formData.channel}
                  onChange={(e) => updateField('channel', e.target.value)}
                />
                {formData.channel === 'EMAIL' && (
                  <Input
                    label="Subject Line"
                    placeholder="Enter email subject"
                    value={formData.subject}
                    onChange={(e) => updateField('subject', e.target.value)}
                  />
                )}
              </div>
            </CardContent>
          </>
        )}

        {/* Step 2: Content */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle>Campaign Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Message Content
                </label>
                <WYSIWYGEditor
                  content={formData.content}
                  onChange={(html) => updateField('content', html)}
                />
                <p className="text-xs text-slate-400">
                  Compose your message using the editor above. You can format text,
                  add links, and insert images.
                </p>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 3: Recipients */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle>Select Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <RecipientSelector
                value={formData.recipientType}
                onChange={(val) => updateField('recipientType', val)}
              />
            </CardContent>
          </>
        )}

        {/* Step 4: Review & Send */}
        {currentStep === 4 && (
          <>
            <CardHeader>
              <CardTitle>Review & Send</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">
                    Campaign Summary
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Name</dt>
                      <dd className="font-medium text-slate-900">
                        {formData.name || 'Not set'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Channel</dt>
                      <dd className="font-medium text-slate-900">
                        {formData.channel || 'Not set'}
                      </dd>
                    </div>
                    {formData.channel === 'EMAIL' && (
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Subject</dt>
                        <dd className="font-medium text-slate-900">
                          {formData.subject || 'Not set'}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Recipients</dt>
                      <dd className="font-medium text-slate-900">
                        {recipientLabel}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Content</dt>
                      <dd className="font-medium text-slate-900">
                        {formData.content ? 'Composed' : 'Not set'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {formData.content && (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-slate-900">
                      Content Preview
                    </h4>
                    <div
                      className="prose prose-sm max-w-none text-slate-700"
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          leftIcon={<ChevronLeft className="h-4 w-4" />}
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            rightIcon={<ChevronRight className="h-4 w-4" />}
            onClick={handleNext}
          >
            Next
          </Button>
        ) : (
          <Button
            leftIcon={<Send className="h-4 w-4" />}
            onClick={handleSend}
          >
            Send Campaign
          </Button>
        )}
      </div>
    </div>
  );
}
