/**
 * Listener-side PCM16 playback via Web Audio: incoming frames are scheduled
 * back-to-back on a small (~250 ms) jitter buffer. If the network stalls and
 * a backlog piles up, playback skips forward rather than drifting further
 * and further behind the preacher — live matters more than complete
 * (spec §27).
 */

const JITTER_S = 0.25;
const MAX_BACKLOG_S = 2.5;

export class PcmPlayer {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private nextTime = 0;
  private muted = false;
  private sampleRate: number;

  constructor(sampleRate: number) {
    this.sampleRate = sampleRate;
  }

  /** Must be called from a user gesture (mobile autoplay policy). */
  async unlock(): Promise<void> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.gain = this.ctx.createGain();
      this.gain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  setSampleRate(rate: number): void {
    this.sampleRate = rate;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.gain && this.ctx) {
      this.gain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.02);
    }
  }

  get isReady(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  enqueue(pcm16: ArrayBuffer): void {
    if (!this.ctx || !this.gain || this.muted) return;
    const samples = new Int16Array(pcm16);
    if (samples.length === 0) return;

    const floats = new Float32Array(samples.length);
    for (let i = 0; i < samples.length; i++) floats[i] = samples[i] / 32768;

    const buffer = this.ctx.createBuffer(1, floats.length, this.sampleRate);
    buffer.copyToChannel(floats, 0);

    const now = this.ctx.currentTime;
    if (this.nextTime < now + JITTER_S) {
      this.nextTime = now + JITTER_S;
    } else if (this.nextTime - now > MAX_BACKLOG_S) {
      // Stalled network released a burst — jump forward to stay near-live.
      this.nextTime = now + JITTER_S;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gain);
    source.start(this.nextTime);
    this.nextTime += buffer.duration;
  }

  async close(): Promise<void> {
    if (this.ctx) {
      const ctx = this.ctx;
      this.ctx = null;
      this.gain = null;
      await ctx.close().catch(() => undefined);
    }
  }
}
