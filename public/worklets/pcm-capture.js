/**
 * PCM capture worklet — runs on the audio rendering thread. Takes whatever
 * sample rate the operator's AudioContext runs at (typically 48 kHz),
 * linear-resamples channel 0 down to 16 kHz mono PCM16 (what translation
 * providers ingest), and posts ~128 ms chunks plus an RMS level for the
 * console's input meter. Plain JS on purpose: worklet files are served
 * statically from /public and never pass through the bundler.
 */
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 16000;
    this.step = sampleRate / this.targetRate; // input samples per output sample
    this.pos = 0; // fractional read position within the current input frame
    this.prev = 0; // last sample of the previous frame (for interpolation)
    this.chunk = new Int16Array(2048); // 2048 @ 16kHz = 128 ms
    this.offset = 0;
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (!channel || channel.length === 0) return true;
    const n = channel.length;

    let pos = this.pos;
    while (pos < n) {
      const i = Math.floor(pos);
      const frac = pos - i;
      const s0 = i >= 0 ? channel[i] : this.prev;
      const s1 = i + 1 < n ? channel[i + 1] : channel[n - 1];
      const sample = s0 + (s1 - s0) * frac;
      const clamped = Math.max(-1, Math.min(1, sample));
      this.chunk[this.offset++] = (clamped * 32767) | 0;

      if (this.offset === this.chunk.length) {
        let sum = 0;
        for (let k = 0; k < this.chunk.length; k += 8) {
          const v = this.chunk[k];
          sum += v * v;
        }
        const rms = Math.sqrt(sum / (this.chunk.length / 8)) / 32768;
        const out = this.chunk;
        this.chunk = new Int16Array(2048);
        this.offset = 0;
        this.port.postMessage({ buffer: out.buffer, rms }, [out.buffer]);
      }
      pos += this.step;
    }
    this.pos = pos - n;
    this.prev = channel[n - 1];
    return true;
  }
}

registerProcessor('pcm-capture', PcmCaptureProcessor);
