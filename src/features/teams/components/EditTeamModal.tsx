import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { teamsApi } from '@/features/teams/api/teams.api';
import type { Team, TeamStatus } from '@/types/team';
import type { ApiError } from '@/types';

/**
 * Rename a team, or retire it.
 *
 * The API has always supported this; there was simply no way to reach it, so
 * a team created as "Paul Souls" stayed "Paul Souls" forever. Teams here are
 * named after the person who leads them, and people move.
 */
interface EditTeamModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

export function EditTeamModal({ team, isOpen, onClose }: EditTeamModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description ?? '');
  const [status, setStatus] = useState<TeamStatus>(team.status);

  // Reopening after a cancel should show what is saved, not the abandoned edit.
  useEffect(() => {
    if (isOpen) {
      setName(team.name);
      setDescription(team.description ?? '');
      setStatus(team.status);
    }
  }, [isOpen, team.name, team.description, team.status]);

  const updateMutation = useMutation({
    mutationFn: () => teamsApi.updateTeam(team.id, { name, description: description || undefined, status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams'] });
      void queryClient.invalidateQueries({ queryKey: ['team', team.id] });
      onClose();
    },
  });

  const error = updateMutation.error as ApiError | null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit team">
      <div className="space-y-4">
        {error && <Alert variant="error">{error.message ?? 'Could not save the team.'}</Alert>}

        <Input
          label="Team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bro. Emmanuel - Cell"
          maxLength={150}
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this team responsible for?"
          rows={3}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as TeamStatus)}
        />

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => updateMutation.mutate()} disabled={!name.trim() || updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
