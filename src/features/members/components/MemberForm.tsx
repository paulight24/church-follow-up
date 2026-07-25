import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Member } from '@/types/member';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { MEMBER_STATUS } from '@/lib/constants';

const memberFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  preferredName: z.string().max(100).optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other', '']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  secondaryPhone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  zipCode: z.string().max(20).optional().or(z.literal('')),
  memberStatus: z.enum(['NEW', 'ACTIVE', 'INACTIVE', 'FIRST_TIMER', 'SECOND_TIMER', 'REGULAR', 'WORKER']).optional(),
  joinDate: z.string().optional().or(z.literal('')),
  baptismDate: z.string().optional().or(z.literal('')),
  salvationDate: z.string().optional().or(z.literal('')),
  department: z.string().max(100).optional().or(z.literal('')),
  occupation: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

interface MemberFormProps {
  initialData?: Member | null;
  onSubmit: (data: MemberFormValues) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

const statusOptions = MEMBER_STATUS.map((s) => ({
  label: s.label,
  value: s.value,
}));

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

export function MemberForm({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
}: MemberFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      preferredName: initialData?.preferredName ?? '',
      gender: (initialData?.gender as MemberFormValues['gender']) ?? '',
      dateOfBirth: initialData?.dateOfBirth ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      secondaryPhone: initialData?.secondaryPhone ?? '',
      address: initialData?.address ?? '',
      city: initialData?.city ?? '',
      state: initialData?.state ?? '',
      zipCode: initialData?.zipCode ?? '',
      memberStatus: initialData?.memberStatus ?? 'NEW',
      joinDate: initialData?.joinDate ?? '',
      baptismDate: initialData?.baptismDate ?? '',
      salvationDate: initialData?.salvationDate ?? '',
      department: initialData?.department ?? '',
      occupation: initialData?.occupation ?? '',
      notes: initialData?.notes ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Information */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Personal Information
        </h2>
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
          <Input
            label="Date of Birth"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
        </div>
      </section>

      {/* Contact Information */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+234 801 234 5678"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Secondary Phone"
            type="tel"
            placeholder="+234 801 234 5678"
            error={errors.secondaryPhone?.message}
            {...register('secondaryPhone')}
          />
          <div className="sm:col-span-2">
            <Input
              label="Address"
              placeholder="Enter street address"
              error={errors.address?.message}
              {...register('address')}
            />
          </div>
          <Input
            label="City"
            placeholder="Enter city"
            error={errors.city?.message}
            {...register('city')}
          />
          <Input
            label="State"
            placeholder="Enter state"
            error={errors.state?.message}
            {...register('state')}
          />
          <Input
            label="Zip/Postal Code"
            placeholder="Enter zip code"
            error={errors.zipCode?.message}
            {...register('zipCode')}
          />
        </div>
      </section>

      {/* Church Information */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Church Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Member Status"
            options={statusOptions}
            error={errors.memberStatus?.message}
            {...register('memberStatus')}
          />
          <Input
            label="Join Date"
            type="date"
            error={errors.joinDate?.message}
            {...register('joinDate')}
          />
          <Input
            label="Baptism Date"
            type="date"
            error={errors.baptismDate?.message}
            {...register('baptismDate')}
          />
          <Input
            label="Salvation Date"
            type="date"
            error={errors.salvationDate?.message}
            {...register('salvationDate')}
          />
          <Input
            label="Department"
            placeholder="e.g., Choir, Ushering, Media"
            error={errors.department?.message}
            {...register('department')}
          />
          <Input
            label="Occupation"
            placeholder="Enter occupation"
            error={errors.occupation?.message}
            {...register('occupation')}
          />
        </div>
      </section>

      {/* Additional */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Additional
        </h2>
        <Textarea
          label="Notes"
          placeholder="Any additional notes about this member..."
          maxLength={2000}
          error={errors.notes?.message}
          {...register('notes')}
        />
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
