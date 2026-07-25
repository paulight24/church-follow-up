import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AxiosError } from 'axios';
import { History, Plus, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import type { ApiError } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { formatDateTime } from '@/lib/formatters';
import { usePermission } from '@/hooks/usePermission';
import { callGuidesApi } from '../api/call-guides.api';
import type { CallGuideStatus, QuestionType } from '../types';

const statusVariantMap: Record<CallGuideStatus, 'success' | 'warning' | 'gray'> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'gray',
};

const versionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Script content is required'),
});
type VersionValues = z.infer<typeof versionSchema>;

const questionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  questionType: z.enum(['TEXT', 'YES_NO', 'SCALE', 'MULTIPLE_CHOICE']),
  isRequired: z.boolean(),
});
type QuestionValues = z.infer<typeof questionSchema>;

const questionTypeOptions: { label: string; value: QuestionType }[] = [
  { label: 'Text', value: 'TEXT' },
  { label: 'Yes / No', value: 'YES_NO' },
  { label: 'Scale', value: 'SCALE' },
  { label: 'Multiple Choice', value: 'MULTIPLE_CHOICE' },
];

export function CallGuideEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canUpdate = usePermission('call_guides.update');
  const canPublish = usePermission('call_guides.publish');
  const canDelete = usePermission('call_guides.delete');
  const [versionError, setVersionError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const guideId = id!;

  const {
    data: guide,
    isLoading: isLoadingGuide,
    isError: isGuideError,
  } = useQuery({
    queryKey: ['call-guide', guideId],
    queryFn: () => callGuidesApi.getCallGuide(guideId).then((r) => r.data),
  });

  const { data: versions, isLoading: isLoadingVersions } = useQuery({
    queryKey: ['call-guide-versions', guideId],
    queryFn: () => callGuidesApi.getVersions(guideId).then((r) => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['call-guide', guideId] });
    queryClient.invalidateQueries({ queryKey: ['call-guide-versions', guideId] });
    queryClient.invalidateQueries({ queryKey: ['call-guides'] });
  };

  const {
    register: registerVersion,
    handleSubmit: handleSubmitVersion,
    reset: resetVersion,
    formState: { errors: versionErrors },
  } = useForm<VersionValues>({
    resolver: zodResolver(versionSchema),
    defaultValues: { title: '', content: '' },
  });

  const createVersionMutation = useMutation({
    mutationFn: (values: VersionValues) => callGuidesApi.createVersion(guideId, values),
    onSuccess: () => {
      resetVersion();
      setVersionError(null);
      invalidate();
    },
    onError: (error: AxiosError<ApiError>) => {
      setVersionError(error.response?.data?.message ?? 'Failed to save version.');
    },
  });

  const publishMutation = useMutation({
    mutationFn: (versionId: string) => callGuidesApi.publishVersion(guideId, versionId),
    onSuccess: invalidate,
  });

  const restoreMutation = useMutation({
    mutationFn: (versionId: string) => callGuidesApi.restoreVersion(guideId, versionId),
    onSuccess: invalidate,
  });

  const {
    register: registerQuestion,
    handleSubmit: handleSubmitQuestion,
    reset: resetQuestion,
    formState: { errors: questionErrors },
  } = useForm<QuestionValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: { question: '', questionType: 'TEXT', isRequired: false },
  });

  const createQuestionMutation = useMutation({
    mutationFn: (values: QuestionValues) =>
      callGuidesApi.createQuestion(guideId, {
        question: values.question,
        questionType: values.questionType,
        isRequired: values.isRequired,
      }),
    onSuccess: () => {
      resetQuestion();
      setQuestionError(null);
      invalidate();
    },
    onError: (error: AxiosError<ApiError>) => {
      setQuestionError(error.response?.data?.message ?? 'Failed to add question.');
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => callGuidesApi.deleteQuestion(guideId, questionId),
    onSuccess: invalidate,
  });

  if (isLoadingGuide) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isGuideError || !guide) {
    return (
      <div className="space-y-6">
        <PageHeader title="Call Guide Editor" breadcrumbs={[{ label: 'Call Guides', href: '/call-guides' }, { label: 'Editor' }]} />
        <Card>
          <CardContent className="py-12 text-center text-sm text-rose-600">
            This call guide could not be found.
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/call-guides')}>
                Back to Call Guides
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={guide.name}
        breadcrumbs={[{ label: 'Call Guides', href: '/call-guides' }, { label: guide.name }]}
        actions={<Badge variant={statusVariantMap[guide.status]}>{guide.status}</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Current published script */}
          <Card>
            <CardHeader>
              <CardTitle>Current Script</CardTitle>
            </CardHeader>
            <CardContent>
              {guide.currentVersion ? (
                <div>
                  <p className="text-sm font-medium text-slate-900">{guide.currentVersion.title}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{guide.currentVersion.content}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No published version yet. Create and publish a version below.</p>
              )}
            </CardContent>
          </Card>

          {/* New version form */}
          {canUpdate && (
            <Card>
              <CardHeader>
                <CardTitle>New Version</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmitVersion((values) => {
                    setVersionError(null);
                    createVersionMutation.mutate(values);
                  })}
                  className="space-y-4"
                >
                  {versionError && <Alert variant="error">{versionError}</Alert>}
                  <Input
                    label="Version Title"
                    placeholder="e.g. New Visitor Script v2"
                    error={versionErrors.title?.message}
                    {...registerVersion('title')}
                  />
                  <Textarea
                    label="Script Content"
                    placeholder="Write the call script. Use {{memberName}} and {{workerName}} as placeholders."
                    rows={6}
                    error={versionErrors.content?.message}
                    {...registerVersion('content')}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" isLoading={createVersionMutation.isPending} leftIcon={<Plus className="h-4 w-4" />}>
                      Save Draft Version
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Structured Q&A */}
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {guide.questions.length === 0 && (
                <p className="text-sm text-slate-500">No structured questions yet.</p>
              )}
              {guide.questions.length > 0 && (
                <ul className="space-y-2">
                  {guide.questions
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((q) => (
                      <li
                        key={q.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm text-slate-800">{q.question}</p>
                          <p className="text-xs text-slate-400">
                            {q.questionType.replace(/_/g, ' ')}
                            {q.isRequired ? ' &middot; Required' : ''}
                          </p>
                        </div>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => deleteQuestionMutation.mutate(q.id)}
                            className="shrink-0 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            aria-label="Delete question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </li>
                    ))}
                </ul>
              )}

              {canUpdate && (
                <form
                  onSubmit={handleSubmitQuestion((values) => {
                    setQuestionError(null);
                    createQuestionMutation.mutate(values);
                  })}
                  className="space-y-3 border-t border-slate-100 pt-4"
                >
                  {questionError && <Alert variant="error">{questionError}</Alert>}
                  <Input
                    label="New Question"
                    placeholder="e.g. Have you been able to join any services recently?"
                    error={questionErrors.question?.message}
                    {...registerQuestion('question')}
                  />
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="w-44">
                      <Select label="Type" options={questionTypeOptions} {...registerQuestion('questionType')} />
                    </div>
                    <label className="flex items-center gap-2 pb-2.5 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        {...registerQuestion('isRequired')}
                      />
                      Required
                    </label>
                    <Button type="submit" size="sm" isLoading={createQuestionMutation.isPending} className="ml-auto">
                      Add Question
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Version history sidebar */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <History className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-base">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingVersions && (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              )}
              {!isLoadingVersions && (!versions || versions.length === 0) && (
                <p className="text-sm text-slate-500">No versions yet.</p>
              )}
              {!isLoadingVersions && versions && versions.length > 0 && (
                <ul className="space-y-3">
                  {versions.map((v) => {
                    const isCurrent = guide.currentVersionId === v.id;
                    return (
                      <li key={v.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-900">
                            v{v.versionNumber} &middot; {v.title}
                          </span>
                          {isCurrent && <Badge variant="success">Live</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {v.publishedAt
                            ? `Published ${formatDateTime(v.publishedAt)}`
                            : `Created ${formatDateTime(v.createdAt)}`}
                        </p>
                        <div className="mt-2 flex gap-2">
                          {canPublish && !isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                              isLoading={publishMutation.isPending && publishMutation.variables === v.id}
                              onClick={() => publishMutation.mutate(v.id)}
                            >
                              Publish
                            </Button>
                          )}
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                              isLoading={restoreMutation.isPending && restoreMutation.variables === v.id}
                              onClick={() => restoreMutation.mutate(v.id)}
                            >
                              Restore as Draft
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
