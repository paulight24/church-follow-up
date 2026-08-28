import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { I18nProvider } from '@/i18n';

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const AcceptInvitePage = lazy(() => import('@/features/auth/pages/AcceptInvitePage').then(m => ({ default: m.AcceptInvitePage })));

// Public event registration (no session, reached via a QR code on a printed flier)
const PublicEventRegistrationPage = lazy(() =>
  import('@/features/events/pages/PublicEventRegistrationPage').then(m => ({ default: m.PublicEventRegistrationPage })),
);

// Public marketing funnel: landing page + church self-registration
const LandingPage = lazy(() => import('@/features/public/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const RegisterChurchPage = lazy(() => import('@/features/public/pages/RegisterChurchPage').then(m => ({ default: m.RegisterChurchPage })));
const ContactPage = lazy(() => import('@/features/public/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('@/features/public/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('@/features/public/pages/TermsPage').then(m => ({ default: m.TermsPage })));

// Dashboard
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));

// Guide
const GuidePage = lazy(() => import('@/features/guide/pages/GuidePage').then(m => ({ default: m.GuidePage })));

// Members
const MemberListPage = lazy(() => import('@/features/members/pages/MemberListPage').then(m => ({ default: m.MemberListPage })));
const MemberCreatePage = lazy(() => import('@/features/members/pages/MemberCreatePage').then(m => ({ default: m.MemberCreatePage })));
const MemberEditPage = lazy(() => import('@/features/members/pages/MemberEditPage').then(m => ({ default: m.MemberEditPage })));
const MemberProfilePage = lazy(() => import('@/features/members/pages/MemberProfilePage').then(m => ({ default: m.MemberProfilePage })));
const MemberImportPage = lazy(() => import('@/features/members/pages/MemberImportPage').then(m => ({ default: m.MemberImportPage })));
const DuplicateReviewPage = lazy(() => import('@/features/members/pages/DuplicateReviewPage').then(m => ({ default: m.DuplicateReviewPage })));
const RepliesInboxPage = lazy(() => import('@/features/members/pages/RepliesInboxPage').then(m => ({ default: m.RepliesInboxPage })));

// Teams
const TeamListPage = lazy(() => import('@/features/teams/pages/TeamListPage').then(m => ({ default: m.TeamListPage })));
const TeamDetailPage = lazy(() => import('@/features/teams/pages/TeamDetailPage').then(m => ({ default: m.TeamDetailPage })));

// Follow-ups
const MyFollowUpsPage = lazy(() => import('@/features/follow-ups/pages/MyFollowUpsPage').then(m => ({ default: m.MyFollowUpsPage })));
const FollowUpCyclesPage = lazy(() => import('@/features/follow-ups/pages/FollowUpCyclesPage').then(m => ({ default: m.FollowUpCyclesPage })));

// Escalations
const EscalationsPage = lazy(() => import('@/features/escalations/pages/EscalationsPage').then(m => ({ default: m.EscalationsPage })));
const EscalationDetailPage = lazy(() => import('@/features/escalations/pages/EscalationDetailPage').then(m => ({ default: m.EscalationDetailPage })));

// Campaigns
const CampaignListPage = lazy(() => import('@/features/campaigns/pages/CampaignListPage').then(m => ({ default: m.CampaignListPage })));
const CampaignBuilderPage = lazy(() => import('@/features/campaigns/pages/CampaignBuilderPage').then(m => ({ default: m.CampaignBuilderPage })));
const CampaignAnalyticsPage = lazy(() => import('@/features/campaigns/pages/CampaignAnalyticsPage').then(m => ({ default: m.CampaignAnalyticsPage })));

// Encouragements
const EncouragementListPage = lazy(() => import('@/features/encouragements/pages/EncouragementListPage').then(m => ({ default: m.EncouragementListPage })));
const EncouragementCreatePage = lazy(() => import('@/features/encouragements/pages/EncouragementCreatePage').then(m => ({ default: m.EncouragementCreatePage })));
const EncouragementCardPrintPage = lazy(() => import('@/features/encouragements/pages/EncouragementCardPrintPage').then(m => ({ default: m.EncouragementCardPrintPage })));
const CardTemplateManagePage = lazy(() => import('@/features/encouragements/pages/CardTemplateManagePage').then(m => ({ default: m.CardTemplateManagePage })));

// Prayer Requests
const PrayerRequestListPage = lazy(() => import('@/features/prayer-requests/pages/PrayerRequestListPage').then(m => ({ default: m.PrayerRequestListPage })));
const PrayerDashboardPage = lazy(() => import('@/features/prayer-requests/pages/PrayerDashboardPage').then(m => ({ default: m.PrayerDashboardPage })));
const PublicPrayerRequestPage = lazy(() => import('@/features/prayer-requests/pages/PublicPrayerRequestPage').then(m => ({ default: m.PublicPrayerRequestPage })));

// Services & Attendance
const ServicesPage = lazy(() => import('@/features/attendance/pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ServiceAttendancePage = lazy(() => import('@/features/attendance/pages/ServiceAttendancePage').then(m => ({ default: m.ServiceAttendancePage })));
const AttendanceReportsPage = lazy(() => import('@/features/attendance/pages/AttendanceReportsPage').then(m => ({ default: m.AttendanceReportsPage })));

// Events
const EventListPage = lazy(() => import('@/features/events/pages/EventListPage').then(m => ({ default: m.EventListPage })));
const EventCreatePage = lazy(() => import('@/features/events/pages/EventCreatePage').then(m => ({ default: m.EventCreatePage })));
const EventEditPage = lazy(() => import('@/features/events/pages/EventEditPage').then(m => ({ default: m.EventEditPage })));
const EventDetailPage = lazy(() => import('@/features/events/pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })));

// Profile (self-service)
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Foundation School
const FoundationSchoolPage = lazy(() => import('@/features/foundation-school/pages/FoundationSchoolPage').then(m => ({ default: m.FoundationSchoolPage })));
const CohortDetailPage = lazy(() => import('@/features/foundation-school/pages/CohortDetailPage').then(m => ({ default: m.CohortDetailPage })));

// Call Guides
const CallGuideListPage = lazy(() => import('@/features/call-guides/pages/CallGuideListPage').then(m => ({ default: m.CallGuideListPage })));
const CallGuideEditorPage = lazy(() => import('@/features/call-guides/pages/CallGuideEditorPage').then(m => ({ default: m.CallGuideEditorPage })));

// Announcements
const AnnouncementFeedPage = lazy(() => import('@/features/announcements/pages/AnnouncementFeedPage').then(m => ({ default: m.AnnouncementFeedPage })));
const AnnouncementManagePage = lazy(() => import('@/features/announcements/pages/AnnouncementManagePage').then(m => ({ default: m.AnnouncementManagePage })));

// Notifications
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

// Live Translation (operator console + public listener page reached via QR)
const LiveTranslationPage = lazy(() => import('@/features/live-translation/pages/LiveTranslationPage').then(m => ({ default: m.LiveTranslationPage })));
const PublicListenerPage = lazy(() => import('@/features/live-translation/pages/PublicListenerPage').then(m => ({ default: m.PublicListenerPage })));
const LiveTranslationHistoryPage = lazy(() => import('@/features/live-translation/pages/LiveTranslationHistoryPage').then(m => ({ default: m.LiveTranslationHistoryPage })));
const LiveTranslationSettingsPage = lazy(() => import('@/features/live-translation/pages/LiveTranslationSettingsPage').then(m => ({ default: m.LiveTranslationSettingsPage })));

// Reports
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));

// Admin
const UsersPage = lazy(() => import('@/features/admin/pages/UsersPage').then(m => ({ default: m.UsersPage })));
const PlatformConsolePage = lazy(() => import('@/features/admin/pages/PlatformConsolePage').then(m => ({ default: m.PlatformConsolePage })));
const RolesPage = lazy(() => import('@/features/admin/pages/RolesPage').then(m => ({ default: m.RolesPage })));
const SettingsPage = lazy(() => import('@/features/admin/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AuditLogPage = lazy(() => import('@/features/admin/pages/AuditLogPage').then(m => ({ default: m.AuditLogPage })));
const DepartmentsPage = lazy(() => import('@/features/admin/pages/DepartmentsPage').then(m => ({ default: m.DepartmentsPage })));
const FellowshipGroupsPage = lazy(() => import('@/features/admin/pages/FellowshipGroupsPage').then(m => ({ default: m.FellowshipGroupsPage })));
const ServiceSchedulesPage = lazy(() => import('@/features/admin/pages/ServiceSchedulesPage').then(m => ({ default: m.ServiceSchedulesPage })));

// Creative & Print
const CreativeStudioPage = lazy(() => import('@/features/creative-print/pages/CreativeStudioPage').then(m => ({ default: m.CreativeStudioPage })));
const FlyerCreatePage = lazy(() => import('@/features/creative-print/pages/FlyerCreatePage').then(m => ({ default: m.FlyerCreatePage })));
const FlyerDetailPage = lazy(() => import('@/features/creative-print/pages/FlyerDetailPage').then(m => ({ default: m.FlyerDetailPage })));
const PrintOrderListPage = lazy(() => import('@/features/creative-print/pages/PrintOrderListPage').then(m => ({ default: m.PrintOrderListPage })));
const PrintOrderDetailPage = lazy(() => import('@/features/creative-print/pages/PrintOrderDetailPage').then(m => ({ default: m.PrintOrderDetailPage })));
const PrintOrderCreatePage = lazy(() => import('@/features/creative-print/pages/PrintOrderCreatePage').then(m => ({ default: m.PrintOrderCreatePage })));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" className="text-indigo-600" />
    </div>
  );
}

/**
 * The root path is the funnel entrance: signed-in users go straight to
 * their dashboard; visitors see the public landing page.
 */
function RootGate() {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/welcome" replace />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root: dashboard for members, marketing funnel for visitors */}
        <Route path="/" element={<RootGate />} />

        {/* Public routes */}
        {/* The marketing funnel is localised as one unit: a Spanish visitor
            who lands on a Spanish page and clicks through to an English
            sign-up form would be worse than not translating either. */}
        <Route element={<I18nProvider />}>
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/register-church" element={<RegisterChurchPage />} />
          {/* Sign-in is the doorway to the English application. It is
              translated because being unable to get IN is a hard blocker,
              even though what waits on the other side is English. */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="/contacts" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        <Route path="/prayer" element={<PublicPrayerRequestPage />} />

        {/* Congregation-facing pages, reached by QR by people who may not
            read English. Wrapped in I18nProvider so they render in the
            phone's language (or ?lang=) — the signed-in app stays English. */}
        <Route element={<I18nProvider />}>
          <Route path="/e/:slug" element={<PublicEventRegistrationPage />} />
          <Route path="/live/:slug" element={<PublicListenerPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Dashboard & Guide are open to every authenticated role, so no
                extra permission gate beyond the auth check above. */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/guide" element={<GuidePage />} />

            {/* My Profile (self-service) */}
            <Route element={<ProtectedRoute permission="profile.view_own" />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Members */}
            <Route element={<ProtectedRoute permission="members.view" />}>
              <Route path="/members" element={<MemberListPage />} />
              {/* Static segment out-ranks /members/:id in the router's own
                  scoring, same as /new and /import above it. */}
              <Route path="/members/replies" element={<RepliesInboxPage />} />
              <Route path="/members/:id" element={<MemberProfilePage />} />
            </Route>
            <Route element={<ProtectedRoute permission="members.create" />}>
              <Route path="/members/new" element={<MemberCreatePage />} />
            </Route>
            <Route element={<ProtectedRoute permission="members.update" />}>
              <Route path="/members/:id/edit" element={<MemberEditPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="members.import" />}>
              <Route path="/members/import" element={<MemberImportPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="members.merge_duplicates" />}>
              <Route path="/members/duplicates" element={<DuplicateReviewPage />} />
            </Route>

            {/* Teams */}
            <Route element={<ProtectedRoute permission="teams.view" />}>
              <Route path="/teams" element={<TeamListPage />} />
              <Route path="/teams/:id" element={<TeamDetailPage />} />
            </Route>

            {/* Follow-ups */}
            <Route element={<ProtectedRoute permission={['follow_ups.view', 'follow_ups.view_own']} />}>
              <Route path="/follow-ups" element={<MyFollowUpsPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="follow_ups.manage_cycles" />}>
              <Route path="/follow-ups/cycles" element={<FollowUpCyclesPage />} />
            </Route>

            {/* Escalations */}
            <Route element={<ProtectedRoute permission="escalations.view" />}>
              <Route path="/escalations" element={<EscalationsPage />} />
              <Route path="/escalations/:id" element={<EscalationDetailPage />} />
            </Route>

            {/* Campaigns */}
            <Route element={<ProtectedRoute permission="campaigns.view" />}>
              <Route path="/campaigns" element={<CampaignListPage />} />
              <Route path="/campaigns/:id/analytics" element={<CampaignAnalyticsPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="campaigns.create" />}>
              <Route path="/campaigns/new" element={<CampaignBuilderPage />} />
            </Route>

            {/* Encouragements */}
            <Route element={<ProtectedRoute permission="encouragements.view" />}>
              <Route path="/encouragements" element={<EncouragementListPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="encouragements.create" />}>
              <Route path="/encouragements/new" element={<EncouragementCreatePage />} />
            </Route>
            <Route element={<ProtectedRoute permission="encouragement_cards.print" />}>
              <Route path="/encouragements/cards" element={<EncouragementCardPrintPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="encouragement_cards.edit" />}>
              <Route path="/encouragements/cards/manage" element={<CardTemplateManagePage />} />
            </Route>

            {/* Prayer Requests */}
            <Route element={<ProtectedRoute permission="prayer_requests.view" />}>
              <Route path="/prayer-requests" element={<PrayerRequestListPage />} />
              <Route path="/prayer-requests/dashboard" element={<PrayerDashboardPage />} />
            </Route>

            {/* Services & Attendance */}
            <Route element={<ProtectedRoute permission="services.view" />}>
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceAttendancePage />} />
            </Route>
            <Route element={<ProtectedRoute permission="attendance.view_reports" />}>
              <Route path="/services/reports" element={<AttendanceReportsPage />} />
            </Route>

            {/* Creative & Print. `/creative/new` is registered before
                `/creative/:id` so "new" is never read as a flyer id. */}
            <Route element={<ProtectedRoute permission="creative.create" />}>
              <Route path="/creative/new" element={<FlyerCreatePage />} />
            </Route>
            {/* Orders are registered before /creative/:id so "orders" is
                never parsed as a flyer id. */}
            <Route element={<ProtectedRoute permission="print.view" />}>
              <Route path="/creative/orders" element={<PrintOrderListPage />} />
              <Route path="/creative/orders/:id" element={<PrintOrderDetailPage />} />
            </Route>
            {/* Ordering spends money, so it sits behind print.order rather
                than the creative.view the flyer page uses. Registered before
                /creative/:id for the same reason as the orders routes. */}
            <Route element={<ProtectedRoute permission="print.order" />}>
              <Route path="/creative/:id/order" element={<PrintOrderCreatePage />} />
            </Route>
            <Route element={<ProtectedRoute permission="creative.view" />}>
              <Route path="/creative" element={<CreativeStudioPage />} />
              <Route path="/creative/:id" element={<FlyerDetailPage />} />
            </Route>

            {/* Events */}
            <Route element={<ProtectedRoute permission="events.view" />}>
              <Route path="/events" element={<EventListPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="events.create" />}>
              <Route path="/events/new" element={<EventCreatePage />} />
            </Route>
            <Route element={<ProtectedRoute permission="events.update" />}>
              <Route path="/events/:id/edit" element={<EventEditPage />} />
            </Route>

            {/* Foundation School */}
            <Route element={<ProtectedRoute permission="foundation_school.view" />}>
              <Route path="/foundation-school" element={<FoundationSchoolPage />} />
              <Route path="/foundation-school/:id" element={<CohortDetailPage />} />
            </Route>

            {/* Call Guides */}
            <Route element={<ProtectedRoute permission="call_guides.view" />}>
              <Route path="/call-guides" element={<CallGuideListPage />} />
              <Route path="/call-guides/:id" element={<CallGuideEditorPage />} />
            </Route>

            {/* Announcements */}
            <Route element={<ProtectedRoute permission="announcements.view" />}>
              <Route path="/announcements" element={<AnnouncementFeedPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="announcements.create" />}>
              <Route path="/announcements/manage" element={<AnnouncementManagePage />} />
            </Route>

            {/* Notifications */}
            <Route element={<ProtectedRoute permission="notifications.view" />}>
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Live Translation (operator console) */}
            <Route element={<ProtectedRoute permission={['live_translation.view', 'live_translation.manage']} />}>
              <Route path="/live-translation" element={<LiveTranslationPage />} />
              <Route path="/live-translation/history" element={<LiveTranslationHistoryPage />} />
            </Route>
            <Route element={<ProtectedRoute permission={['live_translation.configure', 'live_translation.manage']} />}>
              <Route path="/live-translation/settings" element={<LiveTranslationSettingsPage />} />
            </Route>

            {/* Reports */}
            <Route element={<ProtectedRoute permission="reports.view" />}>
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute permission="users.view" />}>
              <Route path="/admin/users" element={<UsersPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="roles.view" />}>
              <Route path="/admin/roles" element={<RolesPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="departments.view" />}>
              <Route path="/admin/departments" element={<DepartmentsPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="fellowship_groups.view" />}>
              <Route path="/admin/fellowship-groups" element={<FellowshipGroupsPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="services.manage_schedules" />}>
              <Route path="/admin/service-schedules" element={<ServiceSchedulesPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="system.settings" />}>
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>
            <Route element={<ProtectedRoute permission="audit.view" />}>
              <Route path="/admin/audit-logs" element={<AuditLogPage />} />
            </Route>
            {/* SaaS operator console — platform.admin is exempt from the
                church SUPER_ADMIN bypass on both ends. */}
            <Route element={<ProtectedRoute permission="platform.admin" />}>
              <Route path="/admin/platform" element={<PlatformConsolePage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
