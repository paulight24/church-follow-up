import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Filter, UserCheck, X, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { lookupsApi, campaignsApi } from '../api/campaigns.api';
import type { SegmentDefinition } from '@/types/campaign';

type Mode = 'all' | 'criteria' | 'custom';

function deriveMode(value: SegmentDefinition): Mode {
  if (value.memberIds?.length) return 'custom';
  if (value.departmentIds?.length || value.fellowshipGroupIds?.length || value.teamIds?.length || value.isFirstTimer) {
    return 'criteria';
  }
  return 'all';
}

interface RecipientSelectorProps {
  value: SegmentDefinition;
  onChange: (value: SegmentDefinition) => void;
  /** When a campaign already exists (saved as draft), we can preview the real recipient count. */
  campaignId?: string;
}

export function RecipientSelector({ value, onChange, campaignId }: RecipientSelectorProps) {
  const mode = deriveMode(value);
  const [memberSearch, setMemberSearch] = useState('');
  const debouncedSearch = useDebounce(memberSearch, 300);

  const { data: departments } = useQuery({
    queryKey: ['campaigns', 'lookups', 'departments'],
    queryFn: () => lookupsApi.getDepartments().then((res) => res.data.data),
  });
  const { data: fellowshipGroups } = useQuery({
    queryKey: ['campaigns', 'lookups', 'fellowship-groups'],
    queryFn: () => lookupsApi.getFellowshipGroups().then((res) => res.data.data),
  });
  const { data: teams } = useQuery({
    queryKey: ['campaigns', 'lookups', 'teams'],
    queryFn: () => lookupsApi.getTeams().then((res) => res.data.data),
  });

  const { data: memberResults, isFetching: isSearchingMembers } = useQuery({
    queryKey: ['campaigns', 'lookups', 'members', debouncedSearch],
    queryFn: () => lookupsApi.searchMembers(debouncedSearch).then((res) => res.data.data),
    enabled: mode === 'custom' && debouncedSearch.length >= 2,
  });

  const { data: preview } = useQuery({
    queryKey: ['campaigns', campaignId, 'segment-preview', value],
    queryFn: () => campaignsApi.previewSegment(campaignId as string).then((res) => res.data),
    enabled: Boolean(campaignId),
  });

  const selectedMemberIds = value.memberIds ?? [];
  const [selectedMembers, setSelectedMembers] = useState<Map<string, string>>(new Map());

  const departmentOptions = useMemo(
    () => (departments ?? []).map((d) => ({ label: d.name, value: d.id })),
    [departments],
  );
  const fellowshipGroupOptions = useMemo(
    () => (fellowshipGroups ?? []).map((g) => ({ label: g.name, value: g.id })),
    [fellowshipGroups],
  );
  const teamOptions = useMemo(() => (teams ?? []).map((t) => ({ label: t.name, value: t.id })), [teams]);

  function setMode(next: Mode) {
    if (next === 'all') {
      onChange({});
    } else if (next === 'criteria') {
      onChange({ departmentIds: [], fellowshipGroupIds: [], teamIds: [] });
    } else {
      onChange({ memberIds: [] });
    }
  }

  function toggleMember(member: { id: string; firstName: string; lastName: string }) {
    const isSelected = selectedMemberIds.includes(member.id);
    const nextIds = isSelected
      ? selectedMemberIds.filter((id) => id !== member.id)
      : [...selectedMemberIds, member.id];

    setSelectedMembers((prev) => {
      const next = new Map(prev);
      if (isSelected) next.delete(member.id);
      else next.set(member.id, `${member.firstName} ${member.lastName}`);
      return next;
    });
    onChange({ memberIds: nextIds });
  }

  const modeOptions: Array<{ value: Mode; label: string; description: string; icon: typeof Users }> = [
    { value: 'all', label: 'All Members', description: 'Every member with email consent on file', icon: Users },
    { value: 'criteria', label: 'By Criteria', description: 'Department, fellowship group, team, first-timers', icon: Filter },
    { value: 'custom', label: 'Specific Members', description: 'Search and hand-pick recipients', icon: UserCheck },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {modeOptions.map((option) => {
          const isSelected = mode === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                  isSelected ? 'border-indigo-600' : 'border-slate-300',
                )}
              >
                {isSelected && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', isSelected ? 'text-indigo-600' : 'text-slate-400')} />
                  <span className={cn('text-sm font-medium', isSelected ? 'text-indigo-900' : 'text-slate-900')}>
                    {option.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {mode === 'criteria' && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              label="Department"
              placeholder="Any department"
              options={departmentOptions}
              value={value.departmentIds?.[0] ?? ''}
              onChange={(e) => onChange({ ...value, departmentIds: e.target.value ? [e.target.value] : [] })}
            />
            <Select
              label="Fellowship Group"
              placeholder="Any fellowship group"
              options={fellowshipGroupOptions}
              value={value.fellowshipGroupIds?.[0] ?? ''}
              onChange={(e) => onChange({ ...value, fellowshipGroupIds: e.target.value ? [e.target.value] : [] })}
            />
            <Select
              label="Team"
              placeholder="Any team"
              options={teamOptions}
              value={value.teamIds?.[0] ?? ''}
              onChange={(e) => onChange({ ...value, teamIds: e.target.value ? [e.target.value] : [] })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={value.isFirstTimer ?? false}
              onChange={(e) => onChange({ ...value, isFirstTimer: e.target.checked || undefined })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            First-timers only
          </label>
        </div>
      )}

      {mode === 'custom' && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search members by name or email..."
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
          />

          {selectedMemberIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedMemberIds.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800"
                >
                  {selectedMembers.get(id) ?? id}
                  <button
                    type="button"
                    onClick={() => toggleMember({ id, firstName: '', lastName: '' })}
                    className="text-indigo-500 hover:text-indigo-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {debouncedSearch.length >= 2 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white">
              {isSearchingMembers ? (
                <p className="px-3 py-2 text-sm text-slate-500">Searching...</p>
              ) : (memberResults ?? []).length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-500">No members found</p>
              ) : (
                memberResults!.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member)}
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50',
                        isSelected && 'bg-indigo-50',
                      )}
                    >
                      <span>
                        {member.firstName} {member.lastName}
                        {member.email && <span className="text-slate-400"> · {member.email}</span>}
                      </span>
                      {isSelected && <span className="text-xs font-medium text-indigo-600">Selected</span>}
                    </button>
                  );
                })
              )}
            </div>
          )}
          <p className="text-xs text-slate-400">Type at least 2 characters to search.</p>
        </div>
      )}

      {campaignId ? (
        preview && (
          <p className="text-xs font-medium text-indigo-600">
            ~{preview.estimatedRecipients.toLocaleString()} recipient(s) match this segment
          </p>
        )
      ) : (
        <p className="text-xs text-slate-400">
          Save this campaign as a draft to preview the estimated recipient count.
        </p>
      )}
    </div>
  );
}
