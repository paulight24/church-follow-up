/**
 * Correcting the address an outstanding invite was sent to.
 *
 * Exists because of a real incident: a member was invited with a mistyped
 * address, and there was nowhere in the app to fix it. The address lives on
 * the user account, so editing the member record changed nothing and every
 * resend went to the same dead inbox — while the UI reported success.
 *
 * Only offered for INVITED accounts. Once someone has signed in, that address
 * is their identity and changing it from here would lock them out.
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { usersApi, type AdminUserListItem } from '../api/users.api';

export function CorrectInviteEmailModal({
  user,
  onClose,
}: {
  user: AdminUserListItem;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(user.email);

  const save = useMutation({
    mutationFn: (next: string) => usersApi.updateUser(user.id, { email: next }),
    onSuccess: () => {
      toast({
        title: 'Sign-in email corrected',
        description: 'Press Resend to send the invite to the new address.',
        variant: 'success',
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      onClose();
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast({
        title: 'Could not change the email',
        description: err.response?.data?.message,
        variant: 'error',
      }),
  });

  const trimmed = email.trim();
  const unchanged = trimmed.toLowerCase() === user.email.toLowerCase();

  return (
    <Modal isOpen onClose={onClose} title="Correct the invite email">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!unchanged && trimmed) save.mutate(trimmed);
        }}
      >
        <p className="text-sm text-slate-600">
          {user.firstName} {user.lastName} has not accepted their invite yet, so this address can
          still be changed. It is both where the invite is sent and the address they will sign in
          with.
        </p>

        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={save.isPending} disabled={unchanged || !trimmed}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
