import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Shield, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel -- gradient branding */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-12 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Member Care</span>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-white">
              Nurture every connection.
              <br />
              Strengthen every bond.
            </h1>
            <p className="mt-4 max-w-md text-lg text-indigo-100">
              Track follow-ups, manage teams, and ensure no member falls through the cracks
              with our comprehensive care management system.
            </p>
          </div>

          <div className="grid max-w-md grid-cols-2 gap-4">
            <FeatureItem
              icon={<Users className="h-5 w-5" />}
              title="Team Management"
              description="Organize follow-up teams"
            />
            <FeatureItem
              icon={<Bell className="h-5 w-5" />}
              title="Smart Alerts"
              description="Never miss a follow-up"
            />
            <FeatureItem
              icon={<Shield className="h-5 w-5" />}
              title="Secure & Private"
              description="Role-based access control"
            />
            <FeatureItem
              icon={<Heart className="h-5 w-5" />}
              title="Member Care"
              description="Pastoral support tracking"
            />
          </div>
        </div>

        <p className="text-sm text-indigo-200">
          &copy; {new Date().getFullYear()} Member Care. Built for churches that care.
        </p>
      </div>

      {/* Right panel -- login form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        {/* Mobile branding */}
        <div className="mb-8 text-center lg:hidden">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Member Care</h1>
          <p className="mt-1 text-sm text-slate-500">
            Church Follow-Up Management System
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
            <div className="mb-8 hidden lg:block">
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-500">
                Sign in to your account to continue
              </p>
            </div>
            <div className="mb-8 lg:hidden">
              <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
      <div className="mb-2 text-indigo-200">{icon}</div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-indigo-200">{description}</p>
    </div>
  );
}
