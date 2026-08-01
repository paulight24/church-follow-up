import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { ScriptureSelector } from './ScriptureSelector';
import { ChannelSelector } from './ChannelSelector';
import { AudienceSelector } from './AudienceSelector';
import { ImageAttachmentPicker } from './ImageAttachmentPicker';
import { encouragementsApi } from '../api/encouragements.api';
import type { AudienceDefinition, DeliveryChannel, Encouragement, MediaAssetSummary } from '@/types/encouragement';

interface EditEncouragementModalProps {
  encouragement: Encouragement;
  onClose: () => void;
}

function parseAudience(json?: string | null): AudienceDefinition {
  if (!json) return { all: true };
  try {
    return JSON.parse(json) as AudienceDefinition;
  } catch {
    return { all: true };
  }
}

function parseChannels(json?: string | null): DeliveryChannel[] {
  if (!json) return ['IN_APP'];
  try {
    const parsed = JSON.parse(json) as DeliveryChannel[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['IN_APP'];
  } catch {
    return ['IN_APP'];
  }
}

/**
 * Reuses the same compose building blocks as PastorQuickSend (scripture,
 * channels, audience, image) pre-filled from an existing encouragement, and
 * calls PATCH /encouragements/:id. The backend returns an APPROVED/SCHEDULED
 * message to DRAFT the moment any field is edited (spec 15 section 12) - this
 * modal surfaces that consequence up front rather than letting it surprise
 * whoever clicks Save.
 */
export function EditEncouragementModal({ encouragement, onClose }: EditEncouragementModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(encouragement.title);
  const [message, setMessage] = useState(encouragement.shortMessage);
  const [scriptureReference, setScriptureReference] = useState(encouragement.scriptureReference ?? '');
  const [scriptureText, setScriptureText] = useState(encouragement.scriptureText ?? '');
  const [channels, setChannels] = useState<DeliveryChannel[]>(parseChannels(encouragement.deliveryChannelsJson));
  const [audience, setAudience] = useState<AudienceDefinition>(parseAudience(encouragement.audienceDefinitionJson));
  const [imageAsset, setImageAsset] = useState<MediaAssetSummary | null>(encouragement.imageAsset ?? null);
  const [confirmRevertOpen, setConfirmRevertOpen] = useState(false);

  const willRevertToDraft = useMemo(
    () => encouragement.status === 'APPROVED' || encouragement.status === 'SCHEDULED',
    [encouragement.status],
  );

  const updateMutation = useMutation({
    mutationFn: () =>
      encouragementsApi.updateEncouragement(encouragement.id, {
        title,
        shortMessage: message,
        scriptureReference: scriptureReference || undefined,
        scriptureText: scriptureText || undefined,
        imageAssetId: imageAsset?.id,
        audienceDefinitionJson: audience,
        deliveryChannelsJson: channels,
      }),
    onSuccess: () => {
      toast({ title: 'Encouragement updated', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['encouragements'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Could not update encouragement',
        description: error?.response?.data?.message ?? 'Please try again.',
        variant: 'error',
      });
    },
  });

  function handleSaveClick() {
    if (willRevertToDraft) {
      setConfirmRevertOpen(true);
    } else {
      updateMutation.mutate();
    }
  }

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title="Edit Encouragement"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveClick} isLoading={updateMutation.isPending} disabled={!title.trim() || !message.trim()}>
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          {willRevertToDraft && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                This message is currently <strong>{encouragement.status === 'APPROVED' ? 'Approved' : 'Scheduled'}</strong>.
                Saving any change here will move it back to <strong>Draft</strong> and it will need to be approved again
                before it can be sent.
              </p>
            </div>
          )}

          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

          <Textarea
            label="Message"
            rows={4}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <ScriptureSelector
            value={scriptureReference}
            onChange={(reference, text) => {
              setScriptureReference(reference);
              setScriptureText(text);
            }}
          />

          <ImageAttachmentPicker value={imageAsset} onChange={setImageAsset} />

          <ChannelSelector value={channels} onChange={setChannels} hasImage={Boolean(imageAsset)} />

          <AudienceSelector value={audience} onChange={setAudience} />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmRevertOpen}
        onClose={() => setConfirmRevertOpen(false)}
        onConfirm={() => {
          setConfirmRevertOpen(false);
          updateMutation.mutate();
        }}
        title="This will return the message to Draft"
        message={`"${encouragement.title}" is ${encouragement.status === 'APPROVED' ? 'approved' : 'scheduled'}. Saving your edits reverts it to Draft and clears the existing approval, so it must be approved again before it can be sent.`}
        confirmText="Save & Revert to Draft"
        variant="warning"
      />
    </>
  );
}
