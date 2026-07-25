import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { ScriptureSelector } from './ScriptureSelector';
import { ChannelSelector } from './ChannelSelector';
import { AudienceSelector } from './AudienceSelector';

export function PastorQuickSend() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scriptureReference, setScriptureReference] = useState('');
  const [scriptureText, setScriptureText] = useState('');
  const [channels, setChannels] = useState<string[]>([]);
  const [audience, setAudience] = useState('');

  function handleScriptureChange(reference: string, text: string) {
    setScriptureReference(reference);
    setScriptureText(text);
  }

  function handleSend() {
    if (!title || !message || channels.length === 0 || !audience) {
      alert('Please fill in all required fields: title, message, at least one channel, and audience.');
      return;
    }
    alert(`Encouragement "${title}" will be sent via ${channels.join(', ')} to ${audience}.`);
  }

  const previewMessage = [
    message,
    scriptureText ? `\n\n"${scriptureText}" - ${scriptureReference}` : '',
  ].join('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Send Encouragement</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-5">
          <Input
            label="Title"
            placeholder="e.g. Sunday Morning Blessing"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="Message"
            placeholder="Type your encouragement message..."
            rows={4}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <ScriptureSelector
            value={scriptureReference}
            onChange={handleScriptureChange}
          />

          <ChannelSelector value={channels} onChange={setChannels} />

          <AudienceSelector value={audience} onChange={setAudience} />

          {(message || scriptureText) && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Preview
              </label>
              <Card className="border-dashed">
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">
                    {previewMessage || 'Your message will appear here...'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-center justify-between">
          <p className="text-xs text-slate-500">
            {channels.length > 0
              ? `Sending via ${channels.join(', ')}`
              : 'Select at least one channel'}
          </p>
          <Button
            onClick={handleSend}
            leftIcon={<Send className="h-4 w-4" />}
          >
            Send Encouragement
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
