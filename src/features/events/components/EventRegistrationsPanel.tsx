import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatDateTime } from '@/lib/formatters';
import type { EventFieldKey, EventRecord, EventRegistration } from '@/types/event';
import { eventsApi } from '../api/events.api';
import { EVENT_FIELD_DEFS } from '../lib/eventFields';

const PAGE_SIZE = 20;

// Same client-side CSV construction ReportsPage uses (src/features/reports/pages/ReportsPage.tsx)
// - no export dependency, just a Blob + object URL.
function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const str = value == null ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// A registration's `answers` only holds what THIS event's form actually collected, but the
// linked Member may already have a first/last name, email, or phone on file from elsewhere
// - falling back to it (same as the backend's own CSV export) means the table is still
// readable for an event that, say, only turned on "Tell us how we can pray for you".
function fieldValue(registration: EventRegistration, key: EventFieldKey): string {
  const answer = registration.answers[key];
  if (answer) return answer;
  switch (key) {
    case 'firstName':
      return registration.member?.firstName ?? '';
    case 'lastName':
      return registration.member?.lastName ?? '';
    case 'email':
      return registration.member?.email ?? '';
    case 'phone':
      return registration.member?.phonePrimary ?? '';
    default:
      return '';
  }
}

interface EventRegistrationsPanelProps {
  event: EventRecord;
}

export function EventRegistrationsPanel({ event }: EventRegistrationsPanelProps) {
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const enabledDefs = EVENT_FIELD_DEFS.filter((def) => event.fields[def.key]?.enabled);
  // This event's own questions get their own columns, after the built-in ones.
  const customFields = event.customFields ?? [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event-registrations', event.id, page],
    queryFn: () => eventsApi.getRegistrations(event.id, { page, pageSize: PAGE_SIZE }).then((res) => res.data),
  });

  const registrations = data?.data ?? [];
  const meta = data?.meta;

  async function handleExportCsv() {
    setIsExporting(true);
    try {
      const res = await eventsApi.exportRegistrations(event.id);
      const rows = res.data.map((row) => ({
        'First Name': row.firstName,
        'Last Name': row.lastName,
        Email: row.email,
        Phone: row.phone,
        'Date of Birth': row.dateOfBirth,
        'Wedding Anniversary': row.weddingAnniversary,
        'Prayer Request': row.prayerRequest,
        Status: row.status,
        'Registered At': formatDateTime(row.submittedAt),
      }));
      downloadCsv(`${event.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-registrations.csv`, rows);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <CardTitle className="text-base">Registrations {meta ? `(${meta.total})` : ''}</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={handleExportCsv}
          isLoading={isExporting}
          disabled={!meta || meta.total === 0}
        >
          Export CSV
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-rose-600">Could not load registrations.</p>
        ) : registrations.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No registrations yet"
            description="Once people start signing up from the public link, they'll show up here."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {enabledDefs.map((def) => (
                    <TableHead key={def.key}>{def.label}</TableHead>
                  ))}
                  {customFields.map((field) => (
                    <TableHead key={field.key}>{field.label}</TableHead>
                  ))}
                  <TableHead>Who</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    {enabledDefs.map((def) => (
                      <TableCell key={def.key}>{fieldValue(registration, def.key) || '—'}</TableCell>
                    ))}
                    {customFields.map((field) => (
                      <TableCell key={field.key}>
                        {registration.answers.custom?.[field.key] || '—'}
                      </TableCell>
                    ))}
                    <TableCell>
                      {/* Existing members and brand-new guests both land in
                          this list; the follow-up team needs to see which is
                          which without opening every profile. */}
                      <Badge variant={registration.member?.isFirstTimer ? 'warning' : 'gray'} size="sm">
                        {registration.member?.isFirstTimer ? 'First-timer' : 'Member'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={registration.status === 'CONFIRMED' ? 'success' : 'gray'} size="sm">
                        {registration.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-slate-500">
                      {formatDateTime(registration.submittedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {meta && meta.totalPages > 1 && (
              <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={setPage}
                  totalItems={meta.total}
                  pageSize={meta.limit}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
