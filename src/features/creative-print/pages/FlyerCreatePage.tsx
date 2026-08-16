import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { CalendarDays, ChevronRight, Sparkles } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { eventsApi } from '@/features/events/api/events.api';
import { creativeApi } from '../api/creativePrint.api';
import { PRINT_SIZE_DESCRIPTIONS, PRINT_SIZE_LABELS } from '../lib/format';
import { PRINT_SIZES } from '@/types/creativePrint';
import type { PrintSize } from '@/types/creativePrint';

const schema = z.object({
  title: z.string().trim().min(1, 'Give the flyer a name'),
  eventId: z.string().optional(),
  description: z.string().trim().min(1, 'Describe what you are promoting'),
  printSize: z.enum(PRINT_SIZES),
  qrDestination: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function errorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

export function FlyerCreatePage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { printSize: 'FULL_PAGE', eventId: '', qrDestination: '' },
  });

  const selectedSize = watch('printSize');
  const selectedEventId = watch('eventId');

  // Starting from an existing event is the whole point of building this
  // inside MemberCare: the church should never retype what we already know.
  const { data: events } = useQuery({
    queryKey: ['events', { forFlyer: true }],
    queryFn: () => eventsApi.getEvents({ pageSize: 100 }).then((res) => res.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      creativeApi.createFlyer({
        title: values.title,
        description: values.description,
        eventId: values.eventId || undefined,
        printSize: values.printSize,
        qrDestination: values.qrDestination?.trim() || undefined,
      }),
    onSuccess: (res) => navigate(`/creative/${res.data.id}?generate=1`),
    onError: (err) =>
      setSubmitError(errorMessage(err, 'Could not create the flyer. Please try again.')),
  });

  /** Choosing an event prefills the fields it already answers. */
  function applyEvent(eventId: string) {
    setValue('eventId', eventId);
    const event = events?.find((e) => e.id === eventId);
    if (!event) return;
    setValue('title', event.name, { shouldValidate: true });
    if (event.description) {
      const plain = event.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (plain) setValue('description', plain.slice(0, 800), { shouldValidate: true });
    }
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/creative" className="hover:text-indigo-600">
          Creative Studio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">New flyer</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create a flyer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell MemberCare about the event. It will design the flyer — you approve it before anything
          is printed.
        </p>
      </div>

      {submitError ? <Alert variant="error">{submitError}</Alert> : null}

      <form
        onSubmit={handleSubmit((values) => {
          setSubmitError(null);
          createMutation.mutate(values);
        })}
        className="space-y-8"
      >
        <Card>
          <CardContent className="space-y-4 py-6">
            <h2 className="text-lg font-semibold text-slate-900">What are you promoting?</h2>

            {events && events.length > 0 ? (
              <div>
                <Select
                  label="Start from an existing event (optional)"
                  helpText="We will use its name, date, time and venue so you do not have to retype them."
                  options={[
                    { label: 'Not linked to an event', value: '' },
                    ...events.map((e) => ({ label: e.name, value: e.id })),
                  ]}
                  value={selectedEventId ?? ''}
                  onChange={(e) => applyEvent(e.target.value)}
                />
                {selectedEventId ? (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-700">
                    <CalendarDays className="h-4 w-4" />
                    Event details will be used automatically.
                  </p>
                ) : null}
              </div>
            ) : null}

            <Input
              label="Flyer name"
              placeholder="A Day of Blessing"
              helpText="Only you see this — it is how you will find the flyer later."
              error={errors.title?.message}
              {...register('title')}
            />

            <Textarea
              label="Describe it in your own words"
              rows={5}
              maxLength={2000}
              placeholder="A Day of Blessing on August 30. We are giving away backpacks, school supplies and gift cards. Warm and joyful, families welcome."
              helpText="Write it as you would say it. Mention anything that must appear — dates, giveaways, the venue."
              error={errors.description?.message}
              {...register('description')}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 py-6">
            <h2 className="text-lg font-semibold text-slate-900">Size and link</h2>

            <div>
              <p className="mb-2 block text-sm font-medium text-slate-700">Flyer size</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {PRINT_SIZES.map((size) => (
                  <label
                    key={size}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      selectedSize === size
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={size}
                      className="mt-1 accent-indigo-600"
                      {...register('printSize')}
                    />
                    <span>
                      <span className="block font-medium text-slate-900">
                        {PRINT_SIZE_LABELS[size as PrintSize]}
                      </span>
                      <span className="block text-sm text-slate-500">
                        {PRINT_SIZE_DESCRIPTIONS[size as PrintSize]}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {/* Size fixes the artwork's shape, so it cannot be changed
                  later without regenerating — say so before they choose. */}
              <p className="mt-2 text-sm text-slate-500">
                This sets the shape of the artwork, so changing it later means generating again.
              </p>
            </div>

            <Input
              label="QR code link (optional)"
              placeholder="https://churchmembercare.com/e/day-of-blessing"
              helpText="We generate the QR code ourselves and check it scans correctly before you can order prints."
              error={errors.qrDestination?.message}
              {...register('qrDestination')}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/creative')}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending}
            leftIcon={<Sparkles className="h-4 w-4" />}
          >
            Create and generate
          </Button>
        </div>
      </form>
    </div>
  );
}
