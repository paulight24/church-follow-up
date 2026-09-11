/**
 * The page a printed QR code opens: approved ministry material, one tap each.
 *
 * Everything here is shaped by who is holding the phone — often someone who
 * walked into a church for the first time an hour ago. So: no login, no form
 * in front of the material, no gate before a download. The church's question
 * ("which of these is being used") is answered by an anonymous count on the
 * redirect instead of by asking a new convert for their name before their
 * first book.
 */
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Download, ExternalLink, FileText, Globe, Mail, MapPin, Phone, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { useSeo } from '@/lib/seo';
import { LanguageSwitcher, useTranslation } from '@/i18n';
import { publicResourcesApi } from '../api/publicResources.api';
import { ResourceResponseForm } from '../components/ResourceResponseForm';
import type { PublicResourcePage as PublicResourcePageData } from '@/types/resource';

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-6 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-3 flex justify-end">
          <LanguageSwitcher />
        </div>
        {children}
      </div>
    </div>
  );
}

/** e.g. "PDF · 2.4 MB" — worth knowing before committing a phone plan to it. */
function fileMeta(mimeType?: string | null, sizeBytes?: number | null): string | null {
  const kind = mimeType?.includes('pdf')
    ? 'PDF'
    : mimeType?.startsWith('image/')
      ? 'Image'
      : mimeType?.startsWith('audio/')
        ? 'Audio'
        : mimeType?.startsWith('video/')
          ? 'Video'
          : null;
  const size =
    typeof sizeBytes === 'number' && sizeBytes > 0
      ? sizeBytes >= 1024 * 1024
        ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
      : null;
  return [kind, size].filter(Boolean).join(' · ') || null;
}

function ResourceTile({ item }: { item: PublicResourcePageData['items'][number] }) {
  const isLink = item.kind === 'LINK';
  const meta = isLink ? null : fileMeta(item.mimeType, item.fileSizeBytes);

  return (
    <a
      href={item.url}
      // A hosted file downloads in place; material that lives on someone
      // else's site opens in its own tab so this page is still here when they
      // come back.
      {...(isLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {isLink ? <ExternalLink className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-900">{item.title}</span>
        {item.description && <span className="mt-0.5 block text-sm text-slate-600">{item.description}</span>}
        <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {item.languageLabel && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
              {item.languageLabel}
            </span>
          )}
          {meta && <span>{meta}</span>}
        </span>
      </span>
      <span className="mt-1 shrink-0 text-slate-300">
        {isLink ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      </span>
    </a>
  );
}

export function PublicResourcePage() {
  const { t, locale } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['public-resource-page', slug, locale],
    queryFn: () => publicResourcesApi.getPage(slug!, locale).then((res) => res.data),
    enabled: !!slug,
    retry: false,
  });

  // Reached by QR from a flier for one church, not by search — and it can
  // carry material the church has not chosen to publicise.
  useSeo({ title: data?.title ?? 'Resources', description: 'Church resources.', noIndex: true });

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-24">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      </PageShell>
    );
  }

  if (isError || !data) {
    const notFound = (error as AxiosError | undefined)?.response?.status === 404;
    return (
      <PageShell>
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg sm:p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <SearchX className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-slate-900">
            {notFound ? t('resources.notFoundTitle') : t('resources.errorTitle')}
          </h1>
          <p className="text-slate-600">
            {notFound ? t('resources.notFoundBody') : t('resources.errorBody')}
          </p>
        </div>
      </PageShell>
    );
  }

  const church = data.church;

  return (
    <PageShell>
      {data.heroImageUrl && (
        <img
          src={data.heroImageUrl}
          alt=""
          className="mb-6 w-full rounded-2xl object-cover shadow-sm"
          style={{ maxHeight: 240 }}
        />
      )}

      <div className="mb-7 text-center">
        {/* The church's own mark first. Without it the first page a new
            convert sees is branded as nothing in particular — and this is
            the moment where "am I in the right place?" gets answered. */}
        {church?.logoUrl && (
          <img
            src={church.logoUrl}
            alt=""
            className="mx-auto mb-4 h-16 w-16 rounded-full border border-white bg-white object-contain shadow-sm"
          />
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{data.title}</h1>
        {data.churchName && (
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-indigo-700">
            {data.churchName}
          </p>
        )}
      </div>

      {/* Deliberately NOT a card. Every white card on this page is something
          you can act on — a resource, or the form. Wrapping the welcome
          paragraph in one too made four identical boxes and no hierarchy, so
          nothing read as the thing to do. */}
      {data.intro && (
        <div
          className="mb-7 px-1 text-center text-[15px] leading-relaxed text-slate-600 [&_a]:text-indigo-600 [&_p+p]:mt-3 [&_strong]:text-slate-900"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.intro) }}
        />
      )}

      {data.items.length > 0 ? (
        <>
          <h2 className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t('resources.listLabel')}
          </h2>
          <div className="space-y-3">
            {data.items.map((item) => (
              <ResourceTile key={item.id} item={item} />
            ))}
          </div>
        </>
      ) : (
        <p className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
          {t('resources.emptyBody')}
        </p>
      )}

      {/* After the material, never before it: the books are ungated, and this
          is the other half of that decision. */}
      <ResourceResponseForm slug={slug!} />

      {(data.contactNote || (church && (church.address || church.phone || church.email || church.website))) && (
        <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/60 p-5">
          {data.contactNote && (
            <div
              className="mb-4 text-sm leading-relaxed text-slate-600 [&_a]:text-indigo-600 [&_p+p]:mt-3 [&_strong]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.contactNote) }}
            />
          )}
          {church && (church.address || church.phone || church.email || church.website) && (
            <>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('resources.contactTitle')}
              </h2>
              <ul className="space-y-2 text-sm text-slate-600">
                {church.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>{church.address}</span>
                  </li>
                )}
                {church.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <a href={`tel:${church.phone}`} className="text-indigo-600">
                      {church.phone}
                    </a>
                  </li>
                )}
                {church.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <a href={`mailto:${church.email}`} className="text-indigo-600">
                      {church.email}
                    </a>
                  </li>
                )}
                {church.website && (
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4 shrink-0 text-slate-400" />
                    <a href={church.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600">
                      {church.website.replace(/^https?:\/\//, '')}
                    </a>
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      )}

    </PageShell>
  );
}
