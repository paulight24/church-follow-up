/**
 * Create and edit a resource page. One screen for both, because the only
 * difference is whether there is already a row — and splitting it into a
 * create wizard plus an edit form is how the two drift apart.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { ArrowLeft, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { WYSIWYGEditor } from '@/features/campaigns/components/WYSIWYGEditor';
import type { ApiError } from '@/types';
import type { ResourceItemDraft } from '@/types/resource';
import { resourcesApi } from '../api/resources.api';
import { ResourceItemsEditor } from '../components/ResourceItemsEditor';
import { ResourceQrShare } from '../components/ResourceQrShare';
import { ResourceResponsesPanel } from '../components/ResourceResponsesPanel';

/** Mirrors the API's slug rule, so the error appears before the round trip. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);
}

export function ResourcePageEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: page, isLoading } = useQuery({
    queryKey: ['resource-page', id],
    queryFn: () => resourcesApi.get(id!).then((res) => res.data),
    enabled: !isNew,
  });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  // Tracked so typing a title stops rewriting a slug the church has chosen —
  // the slug gets printed, so it must never move on its own after that.
  const [slugTouched, setSlugTouched] = useState(false);
  const [intro, setIntro] = useState('');
  const [contactNote, setContactNote] = useState('');
  const [items, setItems] = useState<ResourceItemDraft[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Hydrate once per page, not on every `page` object.
  //
  // TanStack Query refetches on window focus, which hands back a new object
  // with the same contents — and seeding the form from that threw away
  // whatever was unsaved. Adding a resource and glancing at another window
  // was enough to lose the row, which is exactly what someone does while
  // hunting for the PDF they are about to upload.
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!page || hydratedFor.current === page.id) return;
    hydratedFor.current = page.id;
    setTitle(page.title);
    setSlug(page.slug);
    setSlugTouched(true);
    setIntro(page.intro ?? '');
    setContactNote(page.contactNote ?? '');
    setItems(page.items);
  }, [page]);

  const effectiveSlug = useMemo(
    () => (slugTouched ? slug : slugify(title)),
    [slug, slugTouched, title]
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['resource-pages'] });
    queryClient.invalidateQueries({ queryKey: ['resource-page', id] });
  };

  const payload = () => ({
    title: title.trim(),
    slug: effectiveSlug,
    intro: intro.trim() || null,
    contactNote: contactNote.trim() || null,
    items: items.map((item) => ({
      ...(item.id ? { id: item.id } : {}),
      title: item.title.trim(),
      description: item.description?.trim() || null,
      kind: item.kind,
      mediaAssetId: item.mediaAssetId ?? null,
      externalUrl: item.externalUrl?.trim() || null,
      languageLabel: item.languageLabel?.trim() || null,
      active: item.active ?? true,
    })),
  });

  const save = useMutation({
    mutationFn: () =>
      isNew
        ? resourcesApi.create(payload()).then((res) => res.data)
        : resourcesApi.update(id!, payload()).then((res) => res.data),
    onSuccess: (saved) => {
      invalidate();
      toast({ title: isNew ? 'Resource page created' : 'Saved', variant: 'success' });
      if (isNew) navigate(`/resources/${saved.id}`, { replace: true });
    },
  });

  const togglePublish = useMutation({
    mutationFn: () =>
      page?.status === 'PUBLISHED' ? resourcesApi.unpublish(id!) : resourcesApi.publish(id!),
    onSuccess: (res) => {
      invalidate();
      toast({
        title: res.data.status === 'PUBLISHED' ? 'The public link is live' : 'Back to a draft',
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ApiError>) =>
      toast({
        title: 'Could not publish',
        description: error.response?.data?.message ?? 'Add at least one resource first.',
        variant: 'error',
      }),
  });

  const remove = useMutation({
    mutationFn: () => resourcesApi.remove(id!),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Resource page deleted', variant: 'success' });
      navigate('/resources');
    },
  });

  const localProblem = !title.trim()
    ? 'Give the page a title.'
    : !effectiveSlug
      ? 'Give the page a link.'
      : items.some((i) => !i.title.trim())
        ? 'Every resource needs a title, or remove it.'
        : items.some((i) => (i.kind === 'FILE' ? !i.mediaAssetId : !i.externalUrl?.trim()))
          ? 'Every resource needs a file or a link.'
          : null;

  if (!isNew && isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/resources" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Resource Pages
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isNew ? 'New Resource Page' : page?.title}
          </h1>
          {page && (
            <div className="mt-1.5 flex items-center gap-2">
              <StatusBadge status={page.status} type="event" />
              {page.status === 'DRAFT' && (
                <span className="text-sm text-slate-500">
                  The public link shows &quot;not found&quot; until you publish.
                </span>
              )}
            </div>
          )}
        </div>
        {page && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              isLoading={togglePublish.isPending}
              leftIcon={
                page.status === 'PUBLISHED' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
              }
              onClick={() => togglePublish.mutate()}
            >
              {page.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
            </Button>
            <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {save.isError && (
        <Alert variant="error">
          {(save.error as AxiosError<ApiError>).response?.data?.message ?? 'Could not save this page.'}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">The page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Title"
            placeholder="Welcome"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Public link"
            placeholder="welcome"
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            helpText={
              page?.status === 'PUBLISHED'
                ? 'Careful: this link may already be printed. Changing it breaks every QR code already out there.'
                : `Public link: ${window.location.origin}/r/${effectiveSlug || 'welcome'} — choose it once; it gets printed.`
            }
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Introduction (optional)
            </label>
            <WYSIWYGEditor content={intro} onChange={setIntro} />
            <p className="mt-1.5 text-xs text-slate-500">
              Write it once, in English. Spanish and Chinese visitors get it translated automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What people can take away</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceItemsEditor value={items} onChange={setItems} disabled={save.isPending} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Below the list (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <WYSIWYGEditor content={contactNote} onChange={setContactNote} />
          <p className="mt-1.5 text-xs text-slate-500">
            Service times, or anything else you want to add. Your church address, phone and website
            are shown underneath automatically.
          </p>
        </CardContent>
      </Card>

      {page && <ResourceQrShare slug={page.slug} title={page.title} />}

      {page && <ResourceResponsesPanel pageId={page.id} pageTitle={page.title} />}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {localProblem && <span className="text-sm text-amber-700">{localProblem}</span>}
        <Button
          isLoading={save.isPending}
          disabled={Boolean(localProblem)}
          leftIcon={<Save className="h-4 w-4" />}
          onClick={() => save.mutate()}
        >
          {isNew ? 'Create Page' : 'Save Changes'}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          remove.mutate();
        }}
        title="Delete this resource page?"
        message="Anyone who scans a QR code pointing at it will get a not-found page. This cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
