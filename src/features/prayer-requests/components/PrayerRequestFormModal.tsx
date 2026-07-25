import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, X, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import api from '@/config/api';
import { prayerRequestsApi } from '../api/prayer-requests.api';
import type { PrayerCategory, PrayerRequestSource } from '@/types/prayerRequest';

interface SearchMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phonePrimary?: string | null;
}

interface PrayerRequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PrayerCategory[];
}

const CONTACT_METHOD_OPTIONS = [
  { label: 'No preference', value: '' },
  { label: 'Phone Call', value: 'PHONE' },
  { label: 'SMS', value: 'SMS' },
  { label: 'Email', value: 'EMAIL' },
  { label: 'WhatsApp', value: 'WHATSAPP' },
];

const SOURCE_OPTIONS: Array<{ label: string; value: PrayerRequestSource | '' }> = [
  { label: 'Unspecified', value: '' },
  { label: 'QR Code Form', value: 'QR_FORM' },
  { label: 'Mobile Form', value: 'MOBILE_FORM' },
  { label: 'Paper Card', value: 'PAPER' },
  { label: 'Member Portal', value: 'PORTAL' },
  { label: 'Phone Call', value: 'CALL' },
  { label: 'Usher', value: 'USHER' },
  { label: 'Pastor', value: 'PASTOR' },
  { label: 'Email', value: 'EMAIL' },
  { label: 'SMS', value: 'SMS' },
];

export function PrayerRequestFormModal({ isOpen, onClose, categories }: PrayerRequestFormModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [mode, setMode] = useState<'member' | 'guest'>('guest');
  const [selectedMember, setSelectedMember] = useState<SearchMember | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const debouncedSearch = useDebounce(memberSearch, 300);

  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [request, setRequest] = useState('');
  const [confidentialityLevel, setConfidentialityLevel] = useState<'STANDARD' | 'CONFIDENTIAL' | 'PASTOR_ONLY'>('STANDARD');
  const [preferredContactMethod, setPreferredContactMethod] = useState('');
  const [wantsCall, setWantsCall] = useState(false);
  const [wantsPastoralContact, setWantsPastoralContact] = useState(false);
  const [source, setSource] = useState<PrayerRequestSource | ''>('');
  const [error, setError] = useState<string | null>(null);

  const memberResults = useQuery({
    queryKey: ['prayer-requests', 'member-search', debouncedSearch],
    queryFn: () =>
      api
        .get<{ data: SearchMember[] }>('/members', { params: { search: debouncedSearch, pageSize: 8 } })
        .then((res) => res.data.data ?? []),
    enabled: mode === 'member' && debouncedSearch.trim().length >= 2,
  });

  const resetForm = () => {
    setMode('guest');
    setSelectedMember(null);
    setMemberSearch('');
    setGuestFirstName('');
    setGuestLastName('');
    setGuestPhone('');
    setGuestEmail('');
    setCategoryId('');
    setRequest('');
    setConfidentialityLevel('STANDARD');
    setPreferredContactMethod('');
    setWantsCall(false);
    setWantsPastoralContact(false);
    setSource('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const createMutation = useMutation({
    mutationFn: prayerRequestsApi.createPrayerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-requests'] });
      toast({ title: 'Prayer request created', variant: 'success' });
      handleClose();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to create prayer request';
      toast({ title: 'Error', description: message, variant: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!request.trim()) {
      setError('Prayer request text is required.');
      return;
    }
    if (mode === 'member' && !selectedMember) {
      setError('Please select a member, or switch to Guest.');
      return;
    }
    if (mode === 'guest' && (!guestFirstName.trim() || !guestLastName.trim())) {
      setError('Guest first and last name are required.');
      return;
    }

    createMutation.mutate({
      memberId: mode === 'member' ? selectedMember!.id : undefined,
      guestFirstName: mode === 'guest' ? guestFirstName.trim() : undefined,
      guestLastName: mode === 'guest' ? guestLastName.trim() : undefined,
      guestPhone: mode === 'guest' && guestPhone.trim() ? guestPhone.trim() : undefined,
      guestEmail: mode === 'guest' && guestEmail.trim() ? guestEmail.trim() : undefined,
      categoryId: categoryId || undefined,
      request: request.trim(),
      confidentialityLevel,
      preferredContactMethod: preferredContactMethod || undefined,
      wantsCall,
      wantsPastoralContact,
      source: source || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Prayer Request"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={createMutation.isPending}>
            Submit Request
          </Button>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('guest')}
            className={cn(
              'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
              mode === 'guest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
            )}
          >
            Guest
          </button>
          <button
            type="button"
            onClick={() => setMode('member')}
            className={cn(
              'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
              mode === 'member' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
            )}
          >
            Existing Member
          </button>
        </div>

        {mode === 'guest' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              value={guestFirstName}
              onChange={(e) => setGuestFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={guestLastName}
              onChange={(e) => setGuestLastName(e.target.value)}
              required
            />
            <Input
              label="Phone (optional)"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
            />
            <Input
              label="Email (optional)"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {selectedMember ? (
              <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-indigo-900">
                  <User className="h-4 w-4" />
                  <span className="font-medium">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </span>
                  {selectedMember.phonePrimary && (
                    <span className="text-indigo-600">- {selectedMember.phonePrimary}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="rounded p-0.5 text-indigo-500 hover:bg-indigo-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search members by name..."
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                {debouncedSearch.trim().length >= 2 && (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200">
                    {memberResults.isLoading ? (
                      <p className="px-3 py-3 text-sm text-slate-400">Searching...</p>
                    ) : (memberResults.data ?? []).length === 0 ? (
                      <p className="px-3 py-3 text-sm text-slate-400">No members found.</p>
                    ) : (
                      (memberResults.data ?? []).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMember(m)}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                        >
                          <span className="font-medium text-slate-800">
                            {m.firstName} {m.lastName}
                          </span>
                          <span className="text-xs text-slate-400">{m.phonePrimary ?? m.email ?? ''}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <Textarea
          label="Prayer Request"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          maxLength={5000}
          rows={4}
          placeholder="What would you like us to pray for?"
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={[{ label: 'Uncategorized', value: '' }, ...categories.map((c) => ({ label: c.name, value: c.id }))]}
          />
          <Select
            label="Confidentiality"
            value={confidentialityLevel}
            onChange={(e) => setConfidentialityLevel(e.target.value as typeof confidentialityLevel)}
            options={[
              { label: 'Standard', value: 'STANDARD' },
              { label: 'Confidential', value: 'CONFIDENTIAL' },
              { label: 'Pastor Only', value: 'PASTOR_ONLY' },
            ]}
          />
          <Select
            label="Preferred Contact Method"
            value={preferredContactMethod}
            onChange={(e) => setPreferredContactMethod(e.target.value)}
            options={CONTACT_METHOD_OPTIONS}
          />
          <Select
            label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value as PrayerRequestSource | '')}
            options={SOURCE_OPTIONS}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={wantsCall}
              onChange={(e) => setWantsCall(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Wants a call back
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={wantsPastoralContact}
              onChange={(e) => setWantsPastoralContact(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Requests pastoral contact
          </label>
        </div>
      </form>
    </Modal>
  );
}
