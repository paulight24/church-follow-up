import { Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export function CallGuideEditorPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Guide Editor"
        description="Call Guides > Editor"
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Edit3 className="mb-4 h-16 w-16 text-slate-300" />
          <h2 className="text-xl font-semibold text-slate-900">
            Call Guide Editor Coming Soon
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            You will be able to customize call scripts, add talking points,
            set up branching conversation flows, and create reusable templates
            for your follow-up team.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => navigate('/call-guides')}
          >
            Back to Call Guides
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
