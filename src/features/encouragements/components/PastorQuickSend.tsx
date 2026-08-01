import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, CalendarClock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { cn } from '@/lib/cn';
import { ScriptureSelector } from './ScriptureSelector';
import { ChannelSelector } from './ChannelSelector';
import { AudienceSelector } from './AudienceSelector';
import { ImageAttachmentPicker } from './ImageAttachmentPicker';
import { WhatsAppSharePanel } from './WhatsAppSharePanel';
import { encouragementsApi, mediaAssetUrl } from '../api/encouragements.api';
import type { AudienceDefinition, DeliveryChannel, MediaAssetSummary } from '@/types/encouragement';

type SendTiming = 'now' | 'scheduled';

export function PastorQuickSend() {
  const canSendAsPastor = usePermission('encouragements.send_as_pastor');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scriptureReference, setScriptureReference] = useState('');
  const [scriptureText, setScriptureText] = useState('');
  const [channels, setChannels] = useState<DeliveryChannel[]>(['IN_APP', 'EMAIL']);
  const [audience, setAudience] = useState<AudienceDefinition>({ all: true });
  const [sendTiming, setSendTiming] = useState<SendTiming>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [imageAsset, setImageAsset] = useState<MediaAssetSummary | null>(null);
  const [whatsAppShareEnabled, setWhatsAppShareEnabled] = useState(false);

  function handleScriptureChange(reference: string, text: string) {
    setScriptureReference(reference);
    setScriptureText(text);
  }

  const previewMessage = [message, scriptureText ? `\n\n"${scriptureText}" - ${scriptureReference}` : ''].join('');
  const imageUrl = imageAsset ? mediaAssetUrl(imageAsset) : null;

  function resetForm() {
    setTitle('');
    setMessage('');
    setScriptureReference('');
    setScriptureText('');
    setSendTiming('now');
    setScheduledDate('');
    setImageAsset(null);
    setWhatsAppShareEnabled(false);
  }

  const quickSendMutation = useMutation({
    mutationFn: () =>
      encouragementsApi.quickSend({
        title: title || undefined,
        shortMessage: previewMessage,
        imageAssetId: imageAsset?.id,
        audienceDefinitionJson: audience,
        deliveryChannelsJson: channels,
      }),
    onSuccess: (res) => {
      toast({
        title: 'Encouragement sent',
        description: `Delivered to ${res.data.sent} recipient(s)${res.data.skipped ? `, ${res.data.skipped} skipped` : ''}.`,
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['encouragements'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Could not send encouragement',
        description: error?.response?.data?.message ?? 'Please try again.',
        variant: 'error',
      });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      const created = await encouragementsApi.createEncouragement({
        title: title || message.slice(0, 60),
        shortMessage: previewMessage,
        scriptureReference: scriptureReference || undefined,
        scriptureText: scriptureText || undefined,
        imageAssetId: imageAsset?.id,
        messageType: imageAsset ? 'IMAGE' : undefined,
        senderDisplayName: 'Pastor',
        sendAsPastor: true,
        audienceDefinitionJson: audience,
        deliveryChannelsJson: channels,
      });
      const scheduledAtIso = new Date(`${scheduledDate}T08:00:00`).toISOString();
      return encouragementsApi.scheduleEncouragement(created.data.id, scheduledAtIso);
    },
    onSuccess: () => {
      toast({ title: 'Encouragement scheduled', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['encouragements'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Could not schedule encouragement',
        description: error?.response?.data?.message ?? 'Please try again.',
        variant: 'error',
      });
    },
  });

  function handleSend() {
    if (!message.trim()) {
      toast({ title: 'A message is required', variant: 'warning' });
      return;
    }
    if (channels.length === 0) {
      toast({ title: 'Select at least one delivery channel', variant: 'warning' });
      return;
    }
    if (sendTiming === 'scheduled') {
      if (!scheduledDate) {
        toast({ title: 'Choose a date to schedule for', variant: 'warning' });
        return;
      }
      scheduleMutation.mutate();
    } else {
      quickSendMutation.mutate();
    }
  }

  const isSubmitting = quickSendMutation.isPending || scheduleMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Send Encouragement</CardTitle>
      </CardHeader>

      <CardContent>
        {!canSendAsPastor && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>You don&apos;t have permission to send encouragements as the pastor. Ask an administrator to grant it.</p>
          </div>
        )}

        <fieldset disabled={!canSendAsPastor} className={cn('space-y-5', !canSendAsPastor && 'opacity-60')}>
          <Input
            label="Title (optional)"
            placeholder="e.g. Sunday Morning Blessing"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="Message"
            placeholder="Type your encouragement message..."
            rows={4}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <ScriptureSelector value={scriptureReference} onChange={handleScriptureChange} />

          <ImageAttachmentPicker value={imageAsset} onChange={setImageAsset} />

          <ChannelSelector
            value={channels}
            onChange={setChannels}
            hasImage={Boolean(imageAsset)}
            whatsAppShareEnabled={whatsAppShareEnabled}
            onWhatsAppShareChange={setWhatsAppShareEnabled}
          />

          {whatsAppShareEnabled && <WhatsAppSharePanel message={previewMessage} imageUrl={imageUrl} />}

          <AudienceSelector value={audience} onChange={setAudience} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Delivery Timing</label>
            <div className="flex flex-wrap gap-4">
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-all',
                  sendTiming === 'now' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300',
                )}
              >
                <input
                  type="radio"
                  name="sendTiming"
                  value="now"
                  checked={sendTiming === 'now'}
                  onChange={() => setSendTiming('now')}
                  className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className={cn('text-sm font-medium', sendTiming === 'now' ? 'text-indigo-900' : 'text-slate-700')}>
                  Send Now
                </span>
              </label>

              <label
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-all',
                  sendTiming === 'scheduled' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300',
                )}
              >
                <input
                  type="radio"
                  name="sendTiming"
                  value="scheduled"
                  checked={sendTiming === 'scheduled'}
                  onChange={() => setSendTiming('scheduled')}
                  className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className={cn('text-sm font-medium', sendTiming === 'scheduled' ? 'text-indigo-900' : 'text-slate-700')}>
                  Schedule for Later
                </span>
              </label>
            </div>

            {sendTiming === 'scheduled' && (
              <div className="mt-3 max-w-xs">
                <DatePicker
                  label="Scheduled Date"
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  min={new Date().toISOString().split('T')[0]}
                  helpText="The encouragement will be sent at 8:00 AM on the selected date"
                />
              </div>
            )}
          </div>

          {(message || scriptureText) && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Preview</label>
              <Card className="border-dashed">
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">
                    {previewMessage || 'Your message will appear here...'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </fieldset>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-center justify-between">
          <p className="text-xs text-slate-500">
            {channels.length > 0 ? `Sending via ${channels.join(', ')}` : 'Select at least one channel'}
          </p>
          <Button
            onClick={handleSend}
            isLoading={isSubmitting}
            disabled={!canSendAsPastor}
            leftIcon={sendTiming === 'scheduled' ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          >
            {sendTiming === 'scheduled' ? 'Schedule Encouragement' : 'Send Encouragement'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
