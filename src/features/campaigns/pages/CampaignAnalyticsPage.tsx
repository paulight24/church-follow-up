import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function CampaignAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaign Analytics"
        subtitle="Track campaign performance and engagement metrics"
      />

      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center text-center">
            <BarChart3 className="h-16 w-16 text-slate-300" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              Campaign Analytics Coming Soon
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              We are building comprehensive analytics to help you track delivery
              rates, open rates, click-through rates, and overall campaign
              performance. Stay tuned for detailed insights and reports.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => window.history.back()}
            >
              Back to Campaigns
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
