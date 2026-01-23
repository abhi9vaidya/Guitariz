/**
 * WebAudio utility for playing chord sounds
 * Generates realistic guitar tones for chord playback
 * 
 * Guitar tuning (standard):
 * String 1 (High E): 329.63 Hz (E4)
 * String 2 (B):      246.94 Hz (B3)
 * String 3 (G):      196.00 Hz (G3)
 * String 4 (D):      146.83 Hz (D3)
 * String 5 (A):      110.00 Hz (A2)
 * String 6 (Low E):   82.41 Hz (E2)
 */

type InstrumentType = 'guitar' | 'piano';

let audioContext: AudioContext | null = null;
let pianoSamplesReady = false;
let pianoSampleLoadStarted = false;
const pianoSampleBuffers: Map<number, AudioBuffer> = new Map();

// Expected sample set (drop files into public/samples/piano/)
// These are center-note anchors; playbackRate shifts in between
const LOCAL_PIANO_SAMPLE_SET = [
  { midi: 48, file: 'piano_C3.mp3' },
  { midi: 52, file: 'piano_E3.mp3' },
  { midi: 55, file: 'piano_G3.mp3' },
  { midi: 60, file: 'piano_C4.mp3' },
  { midi: 64, file: 'piano_E4.mp3' },
  { midi: 67, file: 'piano_G4.mp3' },
  { midi: 72, file: 'piano_C5.mp3' },
];

// Remote fallback (Use a reliable CDN for piano samples)
const REMOTE_PIANO_BASE = 'https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments/samples/piano/';
const REMOTE_PIANO_SAMPLE_SET = [
  { midi: 48, file: 'C3.mp3' },
  { midi: 52, file: 'E3.mp3' },
  { midi: 55, file: 'G3.mp3' },
  { midi: 60, file: 'C4.mp3' },
  { midi: 64, file: 'E4.mp3' },
  { midi: 67, file: 'G4.mp3' },
  { midi: 72, file: 'C5.mp3' },
];

// Initialize audio context on first user interaction
const initAudioContext = (): AudioContext => {
  if (audioContext) return audioContext;
  
  if (typeof window === 'undefined') {
    throw new Error('Audio context requires browser environment');
  }

  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Resume audio context if suspended (required by some browsers)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
};

const log2 = (value: number) => Math.log(value) / Math.log(2);

const midiFromFrequency = (frequency: number) => {
  return 69 + 12 * log2(frequency / 440);
};

const loadSampleSet = async (
  ctx: AudioContext,
  baseUrl: string,
  entries: { midi: number; file: string }[]
) => {
  await Promise.all(
    entries.map(async ({ midi, file }) => {
      if (pianoSampleBuffers.has(midi)) return;
      try {
        const response = await fetch(`${baseUrl}${file}`);
        if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        pianoSampleBuffers.set(midi, audioBuffer);
      } catch {
        // ignore failed fetches
      }
    })
  );
};

const ensurePianoSamples = async () => {
  if (pianoSamplesReady || pianoSampleLoadStarted) return;
  pianoSampleLoadStarted = true;

  try {
    const ctx = initAudioContext();

    // Prefer local assets
    await loadSampleSet(ctx, '/samples/piano/', LOCAL_PIANO_SAMPLE_SET);

    // If none loaded, try remote CC-BY set
    if (pianoSampleBuffers.size === 0) {
      await loadSampleSet(ctx, REMOTE_PIANO_BASE, REMOTE_PIANO_SAMPLE_SET);
    }

    pianoSamplesReady = pianoSampleBuffers.size > 0;
  } catch {
    pianoSamplesReady = false;
  }
};

// Standard guitar tuning frequencies (Hz)
// Strings ordered from 1st (high E) to 6th (low E)
const GUITAR_TUNING = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41];

const createPluckedString = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  panPosition: number = 0
) => {
  const now = ctx.currentTime;
  
  // Pluck: use even shorter noise for cleaner transients
  const burstLength = 0.012; 
  const sampleRate = ctx.sampleRate;
  const burstBuffer = ctx.createBuffer(1, Math.floor(sampleRate * burstLength), sampleRate);
  const data = burstBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length); // Linear fade on noise burst for cleaner pluck
  }

  const noise = ctx.createBufferSource();
  noise.buffer = burstBuffer;

  const delay = ctx.createDelay();
  delay.delayTime.setValueAtTime(1 / frequency, now);

  const feedback = ctx.createGain();
  // Decay logic: Higher notes decay faster naturally
  const decayValue = Math.min(0.99, 0.98 + (40 / frequency) * 0.01);
  feedback.gain.setValueAtTime(decayValue, now);

  const damp = ctx.createBiquadFilter();
  damp.type = 'lowpass';
  damp.frequency.setValueAtTime(Math.min(12000, frequency * 8), now);
  damp.Q.setValueAtTime(0.5, now);

  // Body Resonance: peaking filter at generic wood frequencies
  const body = ctx.createBiquadFilter();
  body.type = 'peaking';
  body.frequency.setValueAtTime(220, now);
  body.gain.setValueAtTime(4, now);
  body.Q.setValueAtTime(0.7, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(volume * 0.3, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.5);

  const panner = ctx.createStereoPanner();
  panner.pan.setValueAtTime(panPosition, now);

  // Karplus-Strong loop
  noise.connect(delay);
  delay.connect(damp);
  damp.connect(feedback);
  feedback.connect(delay);
  
  // Output path
  damp.connect(body);
  body.connect(gain);
  gain.connect(panner);
  panner.connect(ctx.destination);

  noise.start(now);
};

const createSaturator = (ctx: AudioContext, amount: number) => {
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(44100);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * amount);
  }
  shaper.curve = curve;
  shaper.oversample = '4x';
  return shaper;
};

const createPianoTone = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  panPosition: number = 0
) => {
  const now = ctx.currentTime;

  const partialMain = ctx.createOscillator();
  const partialDetune = ctx.createOscillator();
  const partialAir = ctx.createOscillator();

  partialMain.type = 'sine';
  partialMain.frequency.setValueAtTime(frequency, now);

  partialDetune.type = 'triangle';
  partialDetune.frequency.setValueAtTime(frequency * 2, now);
  partialDetune.detune.setValueAtTime(8, now);

  partialAir.type = 'triangle';
  partialAir.frequency.setValueAtTime(frequency * 3, now);
  partialAir.detune.setValueAtTime(-12, now);

  const hammerNoise = ctx.createBufferSource();
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
  }
  hammerNoise.buffer = noiseBuffer;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(6000, now);
  lowpass.frequency.exponentialRampToValueAtTime(1800, now + duration * 0.5);
  lowpass.Q.setValueAtTime(0.8, now);

  const damper = ctx.createBiquadFilter();
  damper.type = 'highpass';
  damper.frequency.setValueAtTime(35, now);
  damper.Q.setValueAtTime(0.8, now);

  const saturator = createSaturator(ctx, 1.6);

  const gainMain = ctx.createGain();
  const gainDetune = ctx.createGain();
  const gainAir = ctx.createGain();
  const gainNoise = ctx.createGain();
  const masterGain = ctx.createGain();

  gainMain.gain.setValueAtTime(volume * 0.6, now);
  gainDetune.gain.setValueAtTime(volume * 0.28, now);
  gainAir.gain.setValueAtTime(volume * 0.18, now);
  gainNoise.gain.setValueAtTime(volume * 0.25, now);
  gainNoise.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(volume * 1.1, now + 0.012);
  masterGain.gain.exponentialRampToValueAtTime(volume * 0.55, now + 0.28);
  masterGain.gain.exponentialRampToValueAtTime(0.0004, now + duration + 0.2);

  const pannerL = ctx.createStereoPanner();
  pannerL.pan.setValueAtTime(Math.max(-0.35, panPosition - 0.12), now);
  const pannerR = ctx.createStereoPanner();
  pannerR.pan.setValueAtTime(Math.min(0.35, panPosition + 0.12), now);

  partialMain.connect(gainMain).connect(lowpass);
  partialDetune.connect(gainDetune).connect(lowpass);
  partialAir.connect(gainAir).connect(lowpass);
  hammerNoise.connect(gainNoise).connect(lowpass);

  lowpass.connect(damper);
  damper.connect(saturator);
  saturator.connect(masterGain);
  masterGain.connect(pannerL);
  masterGain.connect(pannerR);
  pannerL.connect(ctx.destination);
  pannerR.connect(ctx.destination);

  partialMain.start(now);
  partialDetune.start(now);
  partialAir.start(now);
  hammerNoise.start(now);

  partialMain.stop(now + duration + 0.2);
  partialDetune.stop(now + duration + 0.2);
  partialAir.stop(now + duration + 0.2);
  hammerNoise.stop(now + 0.15);
};

const getNearestSample = (midi: number) => {
  if (!pianoSamplesReady || pianoSampleBuffers.size === 0) return null;
  let nearestMidi = -1;
  let smallestDiff = Number.MAX_VALUE;
  for (const key of pianoSampleBuffers.keys()) {
    const diff = Math.abs(key - midi);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      nearestMidi = key;
    }
  }
  if (nearestMidi === -1) return null;
  return { midi: nearestMidi, buffer: pianoSampleBuffers.get(nearestMidi)! };
};

const playSampledPiano = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  panPosition: number
) => {
  const midi = midiFromFrequency(frequency);
  const sample = getNearestSample(midi);
  if (!sample) return false;

  const playbackRate = Math.pow(2, (midi - sample.midi) / 12);
  const now = ctx.currentTime;

  const source = ctx.createBufferSource();
  source.buffer = sample.buffer;
  source.playbackRate.setValueAtTime(playbackRate, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(volume * 0.6, now + 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0003, now + duration + 0.3);

  const panner = ctx.createStereoPanner();
  panner.pan.setValueAtTime(panPosition, now);

  source.connect(gain);
  gain.connect(panner);
  panner.connect(ctx.destination);

  source.start(now);
  source.stop(now + Math.max(duration + 0.5, sample.buffer.duration / playbackRate));

  return true;
};

export const playChord = (frets: number[], volume: number = 0.3): void => {
  const ctx = initAudioContext();

  frets.forEach((fret, stringIndex) => {
    if (fret === -1) return;

    const stringFreq = GUITAR_TUNING[stringIndex];
    const noteFreq = stringFreq * Math.pow(2, fret / 12);
    // Spread stereo slightly per string (-0.4 ... 0.4)
    const pan = (stringIndex / 5) * 0.8 - 0.4;
    createPluckedString(ctx, noteFreq, 2.6, volume, pan);
  });
};

export const playNote = (
  frequency: number,
  duration: number = 1.5,
  volume: number = 0.3,
  instrument: InstrumentType = 'guitar'
): void => {
  const ctx = initAudioContext();
  const panPosition = Math.random() * 0.2 - 0.1; // subtle width

  if (instrument === 'piano') {
    // Trigger async load of samples (non-blocking)
    void ensurePianoSamples();

    const clampedDuration = Math.min(Math.max(duration, 0.6), 3.5);

    const usedSample = playSampledPiano(
      ctx,
      frequency,
      clampedDuration,
      Math.min(volume, 0.7),
      panPosition
    );

    if (!usedSample) {
      createPianoTone(ctx, frequency, clampedDuration, Math.min(volume, 0.5), panPosition);
    }
    return;
  }

  createPluckedString(ctx, frequency, duration, volume, panPosition);
};
