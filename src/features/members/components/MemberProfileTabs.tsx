import { useState } from 'react';
import {
  Phone,
  Mail,
  Home,
  CalendarDays,
  Cake,
  Heart,
  Building2,
  MessageSquare,
  User,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import type { Member } from '@/types/member';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatDate, formatDateTime, formatPhone } from '@/lib/formatters';
import { MemberAttendanceTab } from './MemberAttendanceTab';

interface MemberProfileTabsProps {
  member: Member;
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{value || '--'}</p>
      </div>
    </div>
  );
}

const verificationVariant: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
  VERIFIED: 'success',
  PENDING: 'gray',
  NEEDS_UPDATE: 'warning',
  FAILED: 'danger',
};

export function MemberProfileTabs({ member }: MemberProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const household = member.household;
  const householdAddress = household
    ? [household.addressLine1, household.addressLine2, household.city, household.state, household.postalCode]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabList className="overflow-x-auto">
        <Tab value="overview">Overview</Tab>
        <Tab value="household">Household</Tab>
        <Tab value="contact-verification">Contact Verification</Tab>
        <Tab value="follow-up">Follow-Up History</Tab>
        <Tab value="attendance">Attendance</Tab>
        <Tab value="escalations">Escalations</Tab>
      </TabList>

      {/* Overview Tab */}
      <TabPanel value="overview">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              icon={<Phone className="h-5 w-5" />}
              label="Primary Phone"
              value={member.phonePrimary ? formatPhone(member.phonePrimary) : null}
            />
            <InfoCard
              icon={<Phone className="h-5 w-5" />}
              label="Secondary Phone"
              value={member.phoneSecondary ? formatPhone(member.phoneSecondary) : null}
            />
            <InfoCard icon={<Mail className="h-5 w-5" />} label="Email" value={member.email} />
            <InfoCard
              icon={<Cake className="h-5 w-5" />}
              label="Birthday"
              value={member.dateOfBirth ? formatDate(member.dateOfBirth) : null}
            />
            <InfoCard
              icon={<Heart className="h-5 w-5" />}
              label="Wedding Anniversary"
              value={member.weddingAnniversary ? formatDate(member.weddingAnniversary) : null}
            />
            <InfoCard
              icon={<User className="h-5 w-5" />}
              label="Gender"
              value={member.gender}
            />
            <InfoCard
              icon={<User className="h-5 w-5" />}
              label="Marital Status"
              value={member.maritalStatus}
            />
            <InfoCard
              icon={<Building2 className="h-5 w-5" />}
              label="Department"
              value={member.department?.name}
            />
            <InfoCard
              icon={<Building2 className="h-5 w-5" />}
              label="Cell Group"
              value={member.fellowshipGroup?.name}
            />
            <InfoCard
              icon={<CalendarDays className="h-5 w-5" />}
              label="Last Attendance"
              value={member.lastAttendanceDate ? formatDate(member.lastAttendanceDate) : null}
            />
            <InfoCard
              icon={<MessageSquare className="h-5 w-5" />}
              label="Preferred Contact Method"
              value={member.preferredContactMethod}
            />
            <InfoCard
              icon={<CalendarDays className="h-5 w-5" />}
              label="First Visit Date"
              value={member.firstVisitDate ? formatDate(member.firstVisitDate) : null}
            />
            <InfoCard
              icon={<User className="h-5 w-5" />}
              label="Visitor Journey Stage"
              value={member.visitorJourneyStage}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={member.communicationConsentEmail ? 'success' : 'gray'} size="sm">
              {member.communicationConsentEmail ? 'OK to email' : 'Email consent declined'}
            </Badge>
            <Badge variant={member.communicationConsentSms ? 'success' : 'gray'} size="sm">
              {member.communicationConsentSms ? 'OK to text' : 'SMS consent declined'}
            </Badge>
            <Badge variant={member.communicationConsentWhatsapp ? 'success' : 'gray'} size="sm">
              {member.communicationConsentWhatsapp ? 'OK for WhatsApp' : 'No WhatsApp consent'}
            </Badge>
            {member.doNotContact && (
              <Badge variant="danger" size="sm">
                Do Not Contact
              </Badge>
            )}
          </div>
          {member.preferredContactMethod === 'WHATSAPP' && !member.communicationConsentWhatsapp && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Preferred contact method is WhatsApp, but this member hasn&apos;t consented to WhatsApp messages -
                they will not receive WhatsApp sends until consent is recorded on the Edit page.
              </p>
            </div>
          )}

          {(member.generalNotes || member.pastoralNotes) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {member.generalNotes && (
                <Card>
                  <CardContent className="pt-5">
                    <h3 className="mb-2 text-sm font-semibold text-slate-900">General Notes</h3>
                    <p className="whitespace-pre-wrap text-sm text-slate-600">{member.generalNotes}</p>
                  </CardContent>
                </Card>
              )}
              {member.pastoralNotes !== undefined && member.pastoralNotes !== null && (
                <Card>
                  <CardContent className="pt-5">
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <ShieldCheck className="h-4 w-4 text-slate-400" />
                      Pastoral Notes
                    </h3>
                    <p className="whitespace-pre-wrap text-sm text-slate-600">{member.pastoralNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </TabPanel>

      {/* Household Tab */}
      <TabPanel value="household">
        {household ? (
          <Card>
            <CardContent className="space-y-3 pt-5">
              <h3 className="text-sm font-semibold text-slate-900">{household.householdName}</h3>
              {householdAddress && <p className="text-sm text-slate-600">{householdAddress}</p>}
              {member.householdMemberships && member.householdMemberships.length > 0 && (
                <div className="pt-2">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Household Members
                  </p>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {member.householdMemberships.map((hm) => (
                      <li key={hm.id}>{hm.household.householdName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={Home}
            title="No household on file"
            description="This member is not linked to a household record yet."
          />
        )}
      </TabPanel>

      {/* Contact Verification Tab */}
      <TabPanel value="contact-verification">
        {member.contactVerifications && member.contactVerifications.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Phone Verified</TableHead>
                <TableHead>Email Verified</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {member.contactVerifications.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="whitespace-nowrap">{formatDateTime(v.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={verificationVariant[v.verificationStatus] ?? 'gray'} size="sm">
                      {v.verificationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{v.phoneVerified ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{v.emailVerified ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{v.verificationSource ?? '--'}</TableCell>
                  <TableCell className="max-w-xs truncate">{v.notes ?? '--'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title="No contact verifications yet"
            description="Verified contact attempts for this member will appear here."
          />
        )}
      </TabPanel>

      {/* Follow-Up History Tab */}
      <TabPanel value="follow-up">
        <EmptyState
          icon={CalendarDays}
          title="Coming Soon"
          description={`Follow-up history will be available from the Follow-Ups feature. This member has ${member._count?.followUpTasks ?? 0} follow-up task(s) on file.`}
        />
      </TabPanel>

      {/* Attendance Tab */}
      <TabPanel value="attendance">
        <MemberAttendanceTab memberId={member.id} />
      </TabPanel>

      {/* Escalations Tab */}
      <TabPanel value="escalations">
        <EmptyState
          icon={AlertTriangle}
          title="Coming Soon"
          description={`Escalation details will be available from the Escalations feature. This member has ${member._count?.escalations ?? 0} escalation(s) on file.`}
        />
      </TabPanel>
    </Tabs>
  );
}
