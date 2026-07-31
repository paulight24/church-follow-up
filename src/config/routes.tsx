import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

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

// Foundation School
const FoundationSchoolPage = lazy(() => import('@/features/foundation-school/pages/FoundationSchoolPage').then(m => ({ default: m.FoundationSchoolPage })));
const CohortDetailPage = lazy(() => import('@/features/foundation-school/pages/CohortDetailPage').then(m => ({ default: m.CohortDetailPage })));

// Call Guides
const CallGuideListPage = lazy(() => import('@/features/call-guides/pages/CallGuideListPage').then(m => ({ default: m.CallGuideListPage })));
const CallGuideEditorPage = lazy(() => import('@/features/call-guides/pages/CallGuideEditorPage').then(m => ({ default: m.CallGuideEditorPage })));

// Notifications
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

// Reports
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));

// Admin
const UsersPage = lazy(() => import('@/features/admin/pages/UsersPage').then(m => ({ default: m.UsersPage })));
const RolesPage = lazy(() => import('@/features/admin/pages/RolesPage').then(m => ({ default: m.RolesPage })));
const SettingsPage = lazy(() => import('@/features/admin/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AuditLogPage = lazy(() => import('@/features/admin/pages/AuditLogPage').then(m => ({ default: m.AuditLogPage })));
const DepartmentsPage = lazy(() => import('@/features/admin/pages/DepartmentsPage').then(m => ({ default: m.DepartmentsPage })));
const FellowshipGroupsPage = lazy(() => import('@/features/admin/pages/FellowshipGroupsPage').then(m => ({ default: m.FellowshipGroupsPage })));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" className="text-indigo-600" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/prayer" element={<PublicPrayerRequestPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/guide" element={<GuidePage />} />

            {/* Members */}
            <Route path="/members" element={<MemberListPage />} />
            <Route path="/members/new" element={<MemberCreatePage />} />
            <Route path="/members/import" element={<MemberImportPage />} />
            <Route path="/members/duplicates" element={<DuplicateReviewPage />} />
            <Route path="/members/:id/edit" element={<MemberEditPage />} />
            <Route path="/members/:id" element={<MemberProfilePage />} />

            {/* Teams */}
            <Route path="/teams" element={<TeamListPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />

            {/* Follow-ups */}
            <Route path="/follow-ups" element={<MyFollowUpsPage />} />
            <Route path="/follow-ups/cycles" element={<FollowUpCyclesPage />} />

            {/* Escalations */}
            <Route path="/escalations" element={<EscalationsPage />} />
            <Route path="/escalations/:id" element={<EscalationDetailPage />} />

            {/* Campaigns */}
            <Route path="/campaigns" element={<CampaignListPage />} />
            <Route path="/campaigns/new" element={<CampaignBuilderPage />} />
            <Route path="/campaigns/:id/analytics" element={<CampaignAnalyticsPage />} />

            {/* Encouragements */}
            <Route path="/encouragements" element={<EncouragementListPage />} />
            <Route path="/encouragements/new" element={<EncouragementCreatePage />} />
            <Route path="/encouragements/cards" element={<EncouragementCardPrintPage />} />
            <Route path="/encouragements/cards/manage" element={<CardTemplateManagePage />} />

            {/* Prayer Requests */}
            <Route path="/prayer-requests" element={<PrayerRequestListPage />} />
            <Route path="/prayer-requests/dashboard" element={<PrayerDashboardPage />} />

            {/* Foundation School */}
            <Route path="/foundation-school" element={<FoundationSchoolPage />} />
            <Route path="/foundation-school/:id" element={<CohortDetailPage />} />

            {/* Call Guides */}
            <Route path="/call-guides" element={<CallGuideListPage />} />
            <Route path="/call-guides/:id" element={<CallGuideEditorPage />} />

            {/* Notifications */}
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Reports */}
            <Route path="/reports" element={<ReportsPage />} />

            {/* Admin */}
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/roles" element={<RolesPage />} />
            <Route path="/admin/departments" element={<DepartmentsPage />} />
            <Route path="/admin/fellowship-groups" element={<FellowshipGroupsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
