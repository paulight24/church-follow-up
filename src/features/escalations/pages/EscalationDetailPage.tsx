import { useState } from 'react';
import {
  Phone,
  Mail,
  UserPlus,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { Escalation } from '@/types/escalation';
import { ESCALATION_TYPES, ESCALATION_PRIORITY } from '@/lib/constants';
import { formatDate, formatRelativeDate } from '@/lib/formatters';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { ConfidentialNote } from '../components/ConfidentialNote';

const MOCK_ESCALATION: Escalation = {
  id: '1',
  memberId: 'm1',
  member: {
    id: 'm1',
    firstName: 'Chioma',
    lastName: 'Okafor',
    phone: '+234 803 456 7890',
    email: 'chioma.okafor@email.com',
  },
  reportedById: 'r1',
  reportedBy: { id: 'r1', firstName: 'Adaeze', lastName: 'Nwosu' },
  type: 'CRISIS',
  priority: 'CRITICAL',
  status: 'IN_PROGRESS',
  title: 'Family emergency - urgent pastoral care needed',
  description:
    'Member is going through a severe family crisis and needs immediate pastoral intervention. She reached out during a follow-up call and was visibly distressed. The situation involves both financial hardship and emotional trauma. Immediate prayer and counseling support are recommended.',
  confidentialNotes:
    'Husband lost his job three months ago. There are indications of domestic tension. The member confided that they may be unable to afford their children\'s school fees next term. She has also expressed feelings of spiritual isolation.',
  assignedToId: 'a1',
  assignedTo: { id: 'a1', firstName: 'Pastor', lastName: 'James' },
  createdAt: '2026-07-20T09:30:00Z',
  updatedAt: '2026-07-23T14:00:00Z',
};

interface TimelineEntry {
  id: string;
  date: string;
  user: string;
  action: string;
  detail?: string;
}

const MOCK_TIMELINE: TimelineEntry[] = [
  {
    id: 't1',
    date: '2026-07-20T09:30:00Z',
    user: 'Adaeze Nwosu',
    action: 'Escalation created',
    detail: 'Reported as a crisis with critical priority.',
  },
  {
    id: 't2',
    date: '2026-07-20T11:00:00Z',
    user: 'Admin',
    action: 'Assigned to Pastor James',
    detail: 'Assigned for immediate pastoral intervention.',
  },
  {
    id: 't3',
    date: '2026-07-21T08:45:00Z',
    user: 'Pastor James',
    action: 'Status updated to In Progress',
    detail: 'Initial phone call made. Home visit scheduled for tomorrow.',
  },
  {
    id: 't4',
    date: '2026-07-23T14:00:00Z',
    user: 'Pastor James',
    action: 'Update added',
    detail: 'Home visit completed. Member is coping better. Welfare assessment form submitted to the deacon board.',
  },
];

function getTypeLabel(value: string): string {
  return ESCALATION_TYPES.find((t) => t.value === value)?.label ?? value;
}

function getPriorityBadgeVariant(value: string) {
  const map: Record<string, 'gray' | 'warning' | 'danger'> = {
    LOW: 'gray',
    MEDIUM: 'warning',
    HIGH: 'danger',
    CRITICAL: 'danger',
  };
  return map[value] ?? 'gray';
}

function getPriorityLabel(value: string): string {
  return ESCALATION_PRIORITY.find((p) => p.value === value)?.label ?? value;
}

export function EscalationDetailPage() {
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const escalation = MOCK_ESCALATION;

  return (
    <div className="space-y-6">
      <PageHeader
        title={escalation.title}
        breadcrumbs={[
          { label: 'Escalations', href: '/escalations' },
          { label: 'Detail' },
        ]}
      />

      {/* Status / Priority / Type badges */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={escalation.status} type="escalation" />
        <Badge variant={getPriorityBadgeVariant(escalation.priority)}>
          {getPriorityLabel(escalation.priority)} Priority
        </Badge>
        <Badge variant="default">{getTypeLabel(escalation.type)}</Badge>
        <span className="text-sm text-slate-500">
          Reported {formatRelativeDate(escalation.createdAt)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {escalation.description}
              </p>
            </CardContent>
          </Card>

          {/* Confidential Notes */}
          {escalation.confidentialNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Confidential Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ConfidentialNote content={escalation.confidentialNotes} />
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                {MOCK_TIMELINE.map((entry, index) => (
                  <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Vertical line */}
                    {index < MOCK_TIMELINE.length - 1 && (
                      <div className="absolute left-[15px] top-8 h-full w-px bg-slate-200" />
                    )}
                    {/* Dot */}
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <Clock className="h-4 w-4 text-indigo-600" />
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          {entry.action}
                        </span>
                        <span className="text-xs text-slate-400">
                          by {entry.user}
                        </span>
                      </div>
                      {entry.detail && (
                        <p className="mt-1 text-sm text-slate-600">
                          {entry.detail}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(entry.date, 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resolution Form */}
          {showResolveForm && (
            <Card>
              <CardHeader>
                <CardTitle>Resolve Escalation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    label="Resolution Notes"
                    placeholder="Describe how this escalation was resolved..."
                    rows={4}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                  />
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowResolveForm(false);
                        setResolutionNotes('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      leftIcon={<CheckCircle className="h-4 w-4" />}
                      onClick={() => {
                        alert('Escalation resolved');
                        setShowResolveForm(false);
                      }}
                    >
                      Submit Resolution
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Member Info */}
          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">
                  {escalation.member.firstName} {escalation.member.lastName}
                </p>
                {escalation.member.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{escalation.member.phone}</span>
                  </div>
                )}
                {escalation.member.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{escalation.member.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">
                    Reported By
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-900">
                    {escalation.reportedBy.firstName}{' '}
                    {escalation.reportedBy.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">
                    Assigned To
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-900">
                    {escalation.assignedTo
                      ? `${escalation.assignedTo.firstName} ${escalation.assignedTo.lastName}`
                      : 'Unassigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">
                    Created
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-900">
                    {formatDate(escalation.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">
                    Last Updated
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-900">
                    {formatDate(escalation.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  leftIcon={<UserPlus className="h-4 w-4" />}
                  className="w-full justify-start"
                  onClick={() => alert('Assign escalation')}
                >
                  Assign
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  className="w-full justify-start"
                  onClick={() => alert('Update status')}
                >
                  Update Status
                </Button>
                <Button
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                  className="w-full justify-start"
                  onClick={() => setShowResolveForm(true)}
                >
                  Resolve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
