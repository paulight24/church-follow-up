import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Filter, UserCheck, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { lookupsApi } from '../api/encouragements.api';
import type { AudienceDefinition } from '@/types/encouragement';

type Mode = 'all' | 'criteria' | 'custom';

function deriveMode(value: AudienceDefinition): Mode {
  if (value.memberIds?.length || value.singleMemberId) return 'custom';
  if (value.departmentIds?.length || value.fellowshipGroupIds?.length || value.teamIds?.length || value.isFirstTimer) {
    return 'criteria';
  }
  return 'all';
}

interface AudienceSelectorProps {
  value: AudienceDefinition;
  onChange: (value: AudienceDefinition) => void;
}

export function AudienceSelector({ value, onChange }: AudienceSelectorProps) {
  const mode = deriveMode(value);
  const [memberSearch, setMemberSearch] = useState('');
  const debouncedSearch = useDebounce(memberSearch, 300);

  const { data: departments } = useQuery({
    queryKey: ['encouragements', 'lookups', 'departments'],
    queryFn: () => lookupsApi.getDepartments().then((res) => res.data.data),
  });
  const { data: fellowshipGroups } = useQuery({
    queryKey: ['encouragements', 'lookups', 'fellowship-groups'],
    queryFn: () => lookupsApi.getFellowshipGroups().then((res) => res.data.data),
  });
  const { data: teams } = useQuery({
    queryKey: ['encouragements', 'lookups', 'teams'],
    queryFn: () => lookupsApi.getTeams().then((res) => res.data.data),
  });
  const { data: memberResults, isFetching: isSearchingMembers } = useQuery({
    queryKey: ['encouragements', 'lookups', 'members', debouncedSearch],
    queryFn: () => lookupsApi.searchMembers(debouncedSearch).then((res) => res.data.data),
    enabled: mode === 'custom' && debouncedSearch.length >= 2,
  });

  const [selectedNames, setSelectedNames] = useState<Map<string, string>>(new Map());
  const selectedMemberIds = value.memberIds ?? [];

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
    if (next === 'all') onChange({ all: true });
    else if (next === 'criteria') onChange({ departmentIds: [], fellowshipGroupIds: [], teamIds: [] });
    else onChange({ memberIds: [] });
  }

  function toggleMember(member: { id: string; firstName: string; lastName: string }) {
    const isSelected = selectedMemberIds.includes(member.id);
    const nextIds = isSelected ? selectedMemberIds.filter((id) => id !== member.id) : [...selectedMemberIds, member.id];
    setSelectedNames((prev) => {
      const next = new Map(prev);
      if (isSelected) next.delete(member.id);
      else next.set(member.id, `${member.firstName} ${member.lastName}`);
      return next;
    });
    onChange({ memberIds: nextIds });
  }

  const modeOptions: Array<{ value: Mode; label: string; description: string; icon: typeof Users }> = [
    { value: 'all', label: 'All Members', description: 'Every member eligible to receive encouragements', icon: Users },
    { value: 'criteria', label: 'By Criteria', description: 'Department, fellowship group, team, first-timers', icon: Filter },
    { value: 'custom', label: 'Specific Members', description: 'Search and hand-pick recipients', icon: UserCheck },
  ];

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Target Audience</label>

      <div className="grid gap-2">
        {modeOptions.map((option) => {
          const isSelected = mode === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value)}
              className={cn(
                'flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all',
                isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={cn('text-sm font-medium', isSelected ? 'text-indigo-900' : 'text-slate-900')}>
                  {option.label}
                </span>
                <p className="mt-0.5 text-xs text-slate-500">{option.description}</p>
              </div>
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                  isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 bg-white',
                )}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {mode === 'criteria' && (
        <div className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              label="Department"
              placeholder="Any department"
              options={departmentOptions}
              value={value.departmentIds?.[0] ?? ''}
              onChange={(e) => onChange({ ...value, all: false, departmentIds: e.target.value ? [e.target.value] : [] })}
            />
            <Select
              label="Fellowship Group"
              placeholder="Any fellowship group"
              options={fellowshipGroupOptions}
              value={value.fellowshipGroupIds?.[0] ?? ''}
              onChange={(e) => onChange({ ...value, all: false, fellowshipGroupIds: e.target.value ? [e.target.value] : [] })}
            />
            <Select
              label="Team"
              placeholder="Any team"
              options={teamOptions}
              value={value.teamIds?.[0] ?? ''}
              onChange={(e) => onChange({ ...value, all: false, teamIds: e.target.value ? [e.target.value] : [] })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={value.isFirstTimer ?? false}
              onChange={(e) => onChange({ ...value, all: false, isFirstTimer: e.target.checked || undefined })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            First-timers only
          </label>
        </div>
      )}

      {mode === 'custom' && (
        <div className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
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
                  {selectedNames.get(id) ?? id}
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
    </div>
  );
}
