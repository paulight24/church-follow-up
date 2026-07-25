import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export function PrayerDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prayer Dashboard"
        description="Track and manage prayer requests across the congregation"
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="mb-4 h-16 w-16 text-slate-300" />
          <h2 className="text-xl font-semibold text-slate-900">
            Prayer Dashboard Coming Soon
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            View analytics on prayer request trends, track answered prayers,
            monitor response times, and gain insights into the spiritual needs
            of your congregation.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => navigate('/prayer-requests')}
          >
            Back to Prayer Requests
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
