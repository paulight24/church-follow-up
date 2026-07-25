import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { teamsApi } from '@/features/teams/api/teams.api';
import type { TeamStatus } from '@/types/team';
import type { ApiError } from '@/types';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

export function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TeamStatus>('ACTIVE');

  const createMutation = useMutation({
    mutationFn: () => teamsApi.createTeam({ name, description: description || undefined, status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      handleClose();
      navigate(`/teams/${res.data.id}`);
    },
  });

  const handleClose = () => {
    setName('');
    setDescription('');
    setStatus('ACTIVE');
    createMutation.reset();
    onClose();
  };

  const errorMessage = (createMutation.error as { response?: { data?: ApiError } } | undefined)?.response
    ?.data?.message;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Team"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            isLoading={createMutation.isPending}
            disabled={!name.trim()}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Team
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {createMutation.isError && (
          <Alert variant="error" title="Failed to create team">
            {errorMessage ?? 'Please try again.'}
          </Alert>
        )}
        <Input
          label="Team Name *"
          placeholder="e.g., Zone A Follow-Up"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          label="Description"
          placeholder="What does this team cover?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as TeamStatus)}
        />
      </div>
    </Modal>
  );
}
