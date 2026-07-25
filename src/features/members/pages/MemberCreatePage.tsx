import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { MemberForm } from '@/features/members/components/MemberForm';

export function MemberCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      // In production, this would call membersApi.createMember(data)
      console.log('Creating member:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Member created successfully!');
      navigate('/members');
    } catch (error) {
      console.error('Failed to create member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/members" className="hover:text-indigo-600">
          Members
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">New Member</span>
      </nav>

      <PageHeader title="Add New Member" />

      <Card>
        <CardContent>
          <MemberForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => navigate('/members')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
