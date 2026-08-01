import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HelpCircle, Search as SearchIcon, Wrench } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { cn } from '@/lib/cn';
import { ALL_GUIDE_ROLES, guideGroups, quickStart, type GuideFeature } from '../guideContent';

function isDynamicPath(path: string): boolean {
  return path.includes(':');
}

function matchesQuery(feature: GuideFeature, query: string): boolean {
  if (!query) return true;
  const haystack = [
    feature.title,
    feature.description,
    ...feature.steps,
    ...(feature.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function matchesRoles(feature: GuideFeature, roles: Set<string>): boolean {
  if (roles.size === 0) return true;
  if (!feature.whoCanDoThis || feature.whoCanDoThis.length === 0) return true;
  return feature.whoCanDoThis.some((role) => roles.has(role));
}

interface GuideAccordionHeaderProps {
  feature: GuideFeature;
}

function GuideAccordionHeader({ feature }: GuideAccordionHeaderProps) {
  const Icon = feature.icon;
  return (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-base font-semibold text-slate-900">{feature.title}</span>
        <span className="block truncate text-xs text-slate-400">{feature.path}</span>
      </span>
    </>
  );
}

interface GuideFeatureDetailProps {
  feature: GuideFeature;
}

function GuideFeatureDetail({ feature }: GuideFeatureDetailProps) {
  const relatedNavigablePaths = (feature.relatedPaths ?? []).filter((p) => !isDynamicPath(p));
  const relatedDynamicPaths = (feature.relatedPaths ?? []).filter((p) => isDynamicPath(p));

  return (
    <div className="space-y-4 border-t border-slate-100 pt-4">
      <p className="text-sm text-slate-600">{feature.description}</p>

      <Link
        to={feature.path}
        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
      >
        Open this page <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      {(relatedNavigablePaths.length > 0 || relatedDynamicPaths.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {relatedNavigablePaths.map((path) => (
            <Link
              key={path}
              to={path}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
            >
              <code className="text-[11px]">{path}</code>
              <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
          {relatedDynamicPaths.map((path) => (
            <span
              key={path}
              title="Opens from a specific record — not a standalone page"
              className="inline-flex items-center rounded-full border border-dashed border-slate-200 px-2.5 py-1 text-xs text-slate-400"
            >
              <code className="text-[11px]">{path}</code>
            </span>
          ))}
        </div>
      )}

      <ol className="space-y-1.5">
        {feature.steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-100 text-[11px] font-semibold text-indigo-700">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {feature.tip && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <span className="font-semibold">Tip: </span>
          {feature.tip}
        </div>
      )}

      {feature.prerequisites && feature.prerequisites.length > 0 && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span className="font-semibold">Requires: </span>
          {feature.prerequisites.join(' ')}
        </div>
      )}

      {feature.whoCanDoThis && feature.whoCanDoThis.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500">Who can do this:</span>
          {feature.whoCanDoThis.map((role) => (
            <Badge key={role} variant="gray" size="sm">
              {role}
            </Badge>
          ))}
        </div>
      )}

      {feature.commonQuestions && feature.commonQuestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <HelpCircle className="h-3.5 w-3.5" /> Common questions
          </h4>
          <dl className="space-y-2">
            {feature.commonQuestions.map((item) => (
              <div key={item.q} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <dt className="text-sm font-medium text-slate-800">{item.q}</dt>
                <dd className="mt-0.5 text-sm text-slate-600">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {feature.troubleshooting && feature.troubleshooting.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Wrench className="h-3.5 w-3.5" /> Troubleshooting
          </h4>
          <dl className="space-y-2">
            {feature.troubleshooting.map((item) => (
              <div key={item.symptom} className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2">
                <dt className="text-sm font-medium text-rose-800">{item.symptom}</dt>
                <dd className="mt-0.5 text-sm text-rose-700">{item.fix}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {feature.relatedPages && feature.relatedPages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-xs font-medium text-slate-500">See also:</span>
          {feature.relatedPages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              {page.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function GuidePage() {
  const [query, setQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set());

  const toggleOpen = (path: string) => {
    setOpenPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }
      return next;
    });
  };

  const normalizedQuery = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    return guideGroups
      .map((group) => ({
        ...group,
        features: group.features.filter(
          (feature) => matchesQuery(feature, normalizedQuery) && matchesRoles(feature, selectedRoles),
        ),
      }))
      .filter((group) => group.features.length > 0);
  }, [normalizedQuery, selectedRoles]);

  const totalCount = useMemo(
    () => guideGroups.reduce((sum, group) => sum + group.features.length, 0),
    [],
  );
  const resultCount = filteredGroups.reduce((sum, group) => sum + group.features.length, 0);
  const hasActiveFilters = normalizedQuery.length > 0 || selectedRoles.size > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="App Guide"
        subtitle="A feature-by-feature walkthrough — from the daily follow-up loop to admin settings."
      />

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="default">Quick start</Badge>
          <span className="text-sm text-slate-500">The core follow-up loop, start to finish</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickStart.map((step, i) => (
            <div key={step.label} className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="text-sm">
                <p className="font-medium text-slate-900">{step.label}</p>
                <p className="text-slate-500">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search topics, steps, or keywords..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Filter by role:</span>
          {ALL_GUIDE_ROLES.map((role) => {
            const isActive = selectedRoles.has(role);
            return (
              <button
                key={role}
                type="button"
                aria-pressed={isActive}
                onClick={() => toggleRole(role)}
                className={cn(
                  'rounded-full transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1',
                  !isActive && 'opacity-60 hover:opacity-100',
                )}
              >
                <Badge variant={isActive ? 'default' : 'gray'}>{role}</Badge>
              </button>
            );
          })}
          {selectedRoles.size > 0 && (
            <button
              type="button"
              onClick={() => setSelectedRoles(new Set())}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              Clear roles
            </button>
          )}
        </div>
        <p aria-live="polite" className="text-sm text-slate-500">
          {hasActiveFilters
            ? `Showing ${resultCount} of ${totalCount} guide topics`
            : `${totalCount} guide topics`}
        </p>
      </Card>

      {filteredGroups.length === 0 ? (
        <Card>
          <EmptyState
            icon={SearchIcon}
            title="No matching topics"
            description="Try a different search term, or clear the role filter to see everything."
          />
        </Card>
      ) : (
        filteredGroups.map((group) => (
          <div key={group.header ?? 'general'} className="space-y-3">
            {group.header && (
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{group.header}</h2>
            )}
            <Accordion>
              {group.features.map((feature) => (
                <AccordionItem
                  key={feature.path}
                  id={feature.path}
                  isOpen={openPaths.has(feature.path)}
                  onToggle={() => toggleOpen(feature.path)}
                  title={<GuideAccordionHeader feature={feature} />}
                >
                  <GuideFeatureDetail feature={feature} />
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))
      )}

      <p className="pb-4 text-center text-xs text-slate-400">
        Member Care — Christ Embassy Los Angeles &middot; Guide for staff walkthroughs
      </p>
    </div>
  );
}
