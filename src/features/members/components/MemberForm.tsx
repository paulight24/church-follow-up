import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import type { Member } from '@/types/member';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { lookupsApi } from '@/features/members/api/lookups.api';

const memberFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(150),
  middleName: z.string().max(150).optional().or(z.literal('')),
  lastName: z.string().min(1, 'Last name is required').max(150),
  preferredName: z.string().max(150).optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', '']).optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', '']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
  weddingAnniversary: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phonePrimary: z.string().max(30).optional().or(z.literal('')),
  phoneSecondary: z.string().max(30).optional().or(z.literal('')),
  preferredContactMethod: z.enum(['PHONE', 'SMS', 'EMAIL', 'WHATSAPP', '']).optional(),
  preferredLanguage: z.string().max(50).optional().or(z.literal('')),
  departmentId: z.string().optional().or(z.literal('')),
  fellowshipGroupId: z.string().optional().or(z.literal('')),
  lastAttendanceDate: z.string().optional().or(z.literal('')),
  source: z
    .enum(['GENERAL_FORM', 'FIRST_TIMER_FORM', 'IMPORT', 'MANUAL', 'CAMPAIGN', ''])
    .optional(),
  isFirstTimer: z.boolean().optional(),
  firstVisitDate: z.string().optional().or(z.literal('')),
  bornAgainStatus: z.string().max(50).optional().or(z.literal('')),
  inviterName: z.string().max(150).optional().or(z.literal('')),
  inviterPhone: z.string().max(30).optional().or(z.literal('')),
  visitorJourneyStage: z
    .enum([
      'NEW_FIRST_TIMER',
      'CONTACT_ATTEMPTED',
      'CONTACTED',
      'RETURNING_VISITOR',
      'FOUNDATION_SCHOOL_INVITED',
      'FOUNDATION_SCHOOL_ENROLLED',
      'FOUNDATION_SCHOOL_IN_PROGRESS',
      'GRADUATED',
      'ASSIGNED_TO_CELL',
      'ESTABLISHED_MEMBER',
      '',
    ])
    .optional(),
  communicationConsentEmail: z.boolean().optional(),
  communicationConsentSms: z.boolean().optional(),
  doNotContact: z.boolean().optional(),
  generalNotes: z.string().max(5000).optional().or(z.literal('')),
  pastoralNotes: z.string().max(5000).optional().or(z.literal('')),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;

interface MemberFormProps {
  initialData?: Member | null;
  onSubmit: (data: MemberFormValues) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

const genderOptions = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
];

const maritalStatusOptions = [
  { label: 'Single', value: 'SINGLE' },
  { label: 'Married', value: 'MARRIED' },
  { label: 'Divorced', value: 'DIVORCED' },
  { label: 'Widowed', value: 'WIDOWED' },
];

const contactMethodOptions = [
  { label: 'Phone', value: 'PHONE' },
  { label: 'SMS', value: 'SMS' },
  { label: 'Email', value: 'EMAIL' },
  { label: 'WhatsApp', value: 'WHATSAPP' },
];

const sourceOptions = [
  { label: 'General Form', value: 'GENERAL_FORM' },
  { label: 'First Timer Form', value: 'FIRST_TIMER_FORM' },
  { label: 'Import', value: 'IMPORT' },
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Campaign', value: 'CAMPAIGN' },
];

const visitorJourneyStageOptions = [
  { label: 'New First Timer', value: 'NEW_FIRST_TIMER' },
  { label: 'Contact Attempted', value: 'CONTACT_ATTEMPTED' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Returning Visitor', value: 'RETURNING_VISITOR' },
  { label: 'Foundation School Invited', value: 'FOUNDATION_SCHOOL_INVITED' },
  { label: 'Foundation School Enrolled', value: 'FOUNDATION_SCHOOL_ENROLLED' },
  { label: 'Foundation School In Progress', value: 'FOUNDATION_SCHOOL_IN_PROGRESS' },
  { label: 'Graduated', value: 'GRADUATED' },
  { label: 'Assigned To Cell', value: 'ASSIGNED_TO_CELL' },
  { label: 'Established Member', value: 'ESTABLISHED_MEMBER' },
];

function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function MemberForm({ initialData, onSubmit, isSubmitting, onCancel }: MemberFormProps) {
  const { hasPermission } = useAuth();
  const canManagePastoralNotes =
    hasPermission('members.manage_pastoral_notes') || hasPermission('system.admin');

  const { data: departments } = useQuery({
    queryKey: ['departments', 'lookup'],
    queryFn: () => lookupsApi.getDepartments().then((res) => res.data.data),
  });
  const { data: fellowshipGroups } = useQuery({
    queryKey: ['fellowship-groups', 'lookup'],
    queryFn: () => lookupsApi.getFellowshipGroups().then((res) => res.data.data),
  });

  const departmentOptions = (departments ?? []).map((d) => ({ label: d.name, value: d.id }));
  const fellowshipGroupOptions = (fellowshipGroups ?? []).map((g) => ({ label: g.name, value: g.id }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      firstName: initialData?.firstName ?? '',
      middleName: initialData?.middleName ?? '',
      lastName: initialData?.lastName ?? '',
      preferredName: initialData?.preferredName ?? '',
      gender: (initialData?.gender as MemberFormValues['gender']) ?? '',
      maritalStatus: (initialData?.maritalStatus as MemberFormValues['maritalStatus']) ?? '',
      dateOfBirth: toDateInputValue(initialData?.dateOfBirth),
      weddingAnniversary: toDateInputValue(initialData?.weddingAnniversary),
      email: initialData?.email ?? '',
      phonePrimary: initialData?.phonePrimary ?? '',
      phoneSecondary: initialData?.phoneSecondary ?? '',
      preferredContactMethod:
        (initialData?.preferredContactMethod as MemberFormValues['preferredContactMethod']) ?? '',
      preferredLanguage: initialData?.preferredLanguage ?? '',
      departmentId: initialData?.departmentId ?? '',
      fellowshipGroupId: initialData?.fellowshipGroupId ?? '',
      lastAttendanceDate: toDateInputValue(initialData?.lastAttendanceDate),
      source: (initialData?.source as MemberFormValues['source']) ?? '',
      isFirstTimer: initialData?.isFirstTimer ?? false,
      firstVisitDate: toDateInputValue(initialData?.firstVisitDate),
      bornAgainStatus: initialData?.bornAgainStatus ?? '',
      inviterName: initialData?.inviterName ?? '',
      inviterPhone: initialData?.inviterPhone ?? '',
      visitorJourneyStage:
        (initialData?.visitorJourneyStage as MemberFormValues['visitorJourneyStage']) ?? '',
      communicationConsentEmail: initialData?.communicationConsentEmail ?? true,
      communicationConsentSms: initialData?.communicationConsentSms ?? true,
      doNotContact: initialData?.doNotContact ?? false,
      generalNotes: initialData?.generalNotes ?? '',
      pastoralNotes: initialData?.pastoralNotes ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Information */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Personal Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First Name *"
            placeholder="Enter first name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name *"
            placeholder="Enter last name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
          <Input
            label="Middle Name"
            placeholder="Enter middle name"
            error={errors.middleName?.message}
            {...register('middleName')}
          />
          <Input
            label="Preferred Name"
            placeholder="Enter preferred name"
            error={errors.preferredName?.message}
            {...register('preferredName')}
          />
          <Select
            label="Gender"
            placeholder="Select gender"
            options={genderOptions}
            error={errors.gender?.message}
            {...register('gender')}
          />
          <Select
            label="Marital Status"
            placeholder="Select marital status"
            options={maritalStatusOptions}
            error={errors.maritalStatus?.message}
            {...register('maritalStatus')}
          />
          <Input
            label="Date of Birth"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
          <Input
            label="Wedding Anniversary"
            type="date"
            error={errors.weddingAnniversary?.message}
            {...register('weddingAnniversary')}
          />
        </div>
      </section>

      {/* Contact Information */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Primary Phone"
            type="tel"
            placeholder="+234 801 234 5678"
            error={errors.phonePrimary?.message}
            {...register('phonePrimary')}
          />
          <Input
            label="Secondary Phone"
            type="tel"
            placeholder="+234 801 234 5678"
            error={errors.phoneSecondary?.message}
            {...register('phoneSecondary')}
          />
          <Select
            label="Preferred Contact Method"
            placeholder="Select method"
            options={contactMethodOptions}
            error={errors.preferredContactMethod?.message}
            {...register('preferredContactMethod')}
          />
          <Input
            label="Preferred Language"
            placeholder="e.g., English, Yoruba"
            error={errors.preferredLanguage?.message}
            {...register('preferredLanguage')}
          />
          <div className="flex flex-col justify-center gap-2 pt-2 sm:col-span-2 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                {...register('communicationConsentEmail')}
              />
              OK to email
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                {...register('communicationConsentSms')}
              />
              OK to text (SMS)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                {...register('doNotContact')}
              />
              Do not contact
            </label>
          </div>
        </div>
      </section>

      {/* Church Information */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Church Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Department"
            placeholder="Select department"
            options={departmentOptions}
            error={errors.departmentId?.message}
            {...register('departmentId')}
          />
          <Select
            label="Cell Group"
            placeholder="Select cell group"
            options={fellowshipGroupOptions}
            error={errors.fellowshipGroupId?.message}
            {...register('fellowshipGroupId')}
          />
          <Input
            label="Last Attendance Date"
            type="date"
            error={errors.lastAttendanceDate?.message}
            {...register('lastAttendanceDate')}
          />
          <Select
            label="Source"
            placeholder="Select source"
            options={sourceOptions}
            error={errors.source?.message}
            {...register('source')}
          />
          <Select
            label="Visitor Journey Stage"
            placeholder="Select stage"
            options={visitorJourneyStageOptions}
            error={errors.visitorJourneyStage?.message}
            {...register('visitorJourneyStage')}
          />
          <Input
            label="Born-Again Status"
            placeholder="e.g., Yes, Rededicated"
            error={errors.bornAgainStatus?.message}
            {...register('bornAgainStatus')}
          />
          <label className="flex items-center gap-2 pt-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register('isFirstTimer')}
            />
            This is a first-time visitor
          </label>
        </div>
      </section>

      {/* First-Timer / Invitation Details */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Invitation Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First Visit Date"
            type="date"
            error={errors.firstVisitDate?.message}
            {...register('firstVisitDate')}
          />
          <Input
            label="Inviter Name"
            placeholder="Who invited this person?"
            error={errors.inviterName?.message}
            {...register('inviterName')}
          />
          <Input
            label="Inviter Phone"
            type="tel"
            placeholder="+234 801 234 5678"
            error={errors.inviterPhone?.message}
            {...register('inviterPhone')}
          />
        </div>
      </section>

      {/* Additional */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Additional</h2>
        <Textarea
          label="General Notes"
          placeholder="Any additional notes about this member..."
          maxLength={5000}
          error={errors.generalNotes?.message}
          {...register('generalNotes')}
        />
        {canManagePastoralNotes && (
          <Controller
            control={control}
            name="pastoralNotes"
            render={({ field }) => (
              <Textarea
                label="Pastoral Notes (confidential)"
                placeholder="Sensitive pastoral notes, only visible to authorized staff..."
                maxLength={5000}
                error={errors.pastoralNotes?.message}
                {...field}
              />
            )}
          />
        )}
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update Member' : 'Add Member'}
        </Button>
      </div>
    </form>
  );
}
