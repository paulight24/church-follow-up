import { useState, useMemo } from 'react';
import { Search, X, UserPlus, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

interface SearchableMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
}

const AVAILABLE_MEMBERS: SearchableMember[] = [
  { id: 'u1', firstName: 'Adebayo', lastName: 'Ogunlade', email: 'adebayo.ogunlade@email.com', department: 'Choir' },
  { id: 'u2', firstName: 'Chidinma', lastName: 'Okonkwo', email: 'chidinma.okonkwo@email.com', department: 'Ushering' },
  { id: 'u3', firstName: 'Emeka', lastName: 'Nwosu', email: 'emeka.nwosu@email.com', department: 'Protocol' },
  { id: 'u4', firstName: 'Folake', lastName: 'Adeyemi', email: 'folake.adeyemi@email.com', department: 'Media' },
  { id: 'u5', firstName: 'Ngozi', lastName: 'Okafor', email: 'ngozi.okafor@email.com', department: 'Follow-Up' },
  { id: 'u6', firstName: 'Tunde', lastName: 'Afolabi', email: 'tunde.afolabi@email.com' },
  { id: 'u7', firstName: 'Amaka', lastName: 'Okoro', email: 'amaka.okoro@email.com', department: 'Children Ministry' },
  { id: 'u8', firstName: 'Blessing', lastName: 'Eze', email: 'blessing.eze@email.com', department: 'Hospitality' },
  { id: 'u9', firstName: 'Yetunde', lastName: 'Oladipo', email: 'yetunde.oladipo@email.com', department: 'Evangelism' },
  { id: 'u10', firstName: 'Obinna', lastName: 'Chukwu', email: 'obinna.chukwu@email.com', department: 'Choir' },
];

export function AssignmentModal({ isOpen, onClose, teamId }: AssignmentModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return AVAILABLE_MEMBERS;
    const q = searchQuery.toLowerCase();
    return AVAILABLE_MEMBERS.filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return;
    setIsSubmitting(true);
    try {
      // In production, this would call teamsApi.assignMember for each selected member
      console.log('Assigning members to team:', {
        teamId,
        memberIds: Array.from(selectedIds),
      });
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log('Members assigned successfully!');
      setSelectedIds(new Set());
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error('Failed to assign members:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Team Members"
      size="md"
      footer={
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {selectedIds.size} member{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={selectedIds.size === 0}
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              Add to Team
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Selected Members */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedIds).map((id) => {
              const member = AVAILABLE_MEMBERS.find((m) => m.id === id);
              if (!member) return null;
              return (
                <Badge key={id} variant="default" size="md">
                  <span className="flex items-center gap-1.5">
                    {member.firstName} {member.lastName}
                    <button
                      type="button"
                      onClick={() => toggleMember(id)}
                      className="ml-0.5 rounded-full hover:bg-indigo-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                </Badge>
              );
            })}
          </div>
        )}

        {/* Member List */}
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No members found matching your search.
            </p>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = selectedIds.has(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    isSelected
                      ? 'bg-indigo-50 ring-1 ring-indigo-200'
                      : 'hover:bg-slate-50',
                  )}
                >
                  <Avatar
                    name={`${member.firstName} ${member.lastName}`}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {member.email}
                      {member.department ? ` - ${member.department}` : ''}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-indigo-600" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
