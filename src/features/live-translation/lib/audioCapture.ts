/**
 * Operator-side audio capture: selected input device → AudioWorklet
 * (public/worklets/pcm-capture.js) → 16 kHz PCM16 chunks + RMS level.
 *
 * Processing (echo cancellation / noise suppression / AGC) is disabled on
 * purpose: the recommended source is a clean mixer/OBS feed, and browser
 * "voice call" processing degrades a line-level signal it assumes is a
 * laptop mic in a noisy room.
 */

export interface AudioInputDevice {
  deviceId: string;
  label: string;
}

/** Prompts for mic permission once (labels are blank until granted), then
 *  lists every audio input the browser can see — USB interfaces, mixers
 *  exposed over USB, virtual OBS/loopback devices, built-in mics. */
export async function listAudioInputs(): Promise<AudioInputDevice[]> {
  const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
  probe.getTracks().forEach((t) => t.stop());
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((d) => d.kind === 'audioinput')
    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Audio input ${i + 1}` }));
}

export interface CaptureHandlers {
  onChunk: (pcm16: ArrayBuffer) => void;
  onLevel: (rms: number) => void;
  onError?: (message: string) => void;
}

export interface CaptureHandle {
  deviceLabel: string;
  stop: () => void;
}

export async function startCapture(
  deviceId: string | undefined,
  handlers: CaptureHandlers
): Promise<CaptureHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });
  const track = stream.getAudioTracks()[0];
  const deviceLabel = track?.label ?? 'Microphone';
  const ctx = new AudioContext();
  await ctx.audioWorklet.addModule('/worklets/pcm-capture.js');

  const source = ctx.createMediaStreamSource(stream);
  const worklet = new AudioWorkletNode(ctx, 'pcm-capture', {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    channelCount: 1,
  });
  worklet.port.onmessage = (event: MessageEvent<{ buffer: ArrayBuffer; rms: number }>) => {
    handlers.onLevel(event.data.rms);
    handlers.onChunk(event.data.buffer);
  };

  // A worklet with nothing downstream is never pulled by the graph — route
  // it through a muted gain so it runs without being audible locally.
  const silence = ctx.createGain();
  silence.gain.value = 0;
  source.connect(worklet);
  worklet.connect(silence);
  silence.connect(ctx.destination);

  track?.addEventListener('ended', () => handlers.onError?.('The audio device was disconnected.'));

  let stopped = false;
  return {
    deviceLabel,
    stop: () => {
      if (stopped) return;
      stopped = true;
      worklet.port.onmessage = null;
      try {
        source.disconnect();
        worklet.disconnect();
        silence.disconnect();
      } catch {
        /* graph already torn down */
      }
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close().catch(() => undefined);
    },
  };
}
