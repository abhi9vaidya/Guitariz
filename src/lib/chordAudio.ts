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
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * Math.max(duration, 1), ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const delay = ctx.createDelay();
  delay.delayTime.setValueAtTime(1 / frequency, now);

  const feedback = ctx.createGain();
  feedback.gain.setValueAtTime(0.35 + Math.min(0.25, 150 / frequency * 0.01), now);

  const damp = ctx.createBiquadFilter();
  damp.type = 'lowpass';
  damp.frequency.setValueAtTime(3800, now);
  damp.Q.setValueAtTime(0.9, now);

  const body = ctx.createBiquadFilter();
  body.type = 'peaking';
  body.frequency.setValueAtTime(2200, now);
  body.gain.setValueAtTime(3, now);
  body.Q.setValueAtTime(1.2, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.6);

  const panner = ctx.createStereoPanner();
  panner.pan.setValueAtTime(panPosition, now);

  // Feedback loop for Karplus-Strong pluck
  noise.connect(delay);
  delay.connect(damp);
  damp.connect(feedback);
  feedback.connect(delay);
  damp.connect(body);
  body.connect(gain);
  gain.connect(panner);
  panner.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration + 0.5);
};

const createPianoTone = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  panPosition: number = 0
) => {
  const now = ctx.currentTime;

  const oscMain = ctx.createOscillator();
  const oscShimmer = ctx.createOscillator();
  const oscBody = ctx.createOscillator();

  oscMain.type = 'triangle';
  oscMain.frequency.setValueAtTime(frequency, now);

  oscShimmer.type = 'sine';
  oscShimmer.frequency.setValueAtTime(frequency * 2, now);

  oscBody.type = 'sawtooth';
  oscBody.frequency.setValueAtTime(frequency * 0.5, now);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(5200, now);
  lowpass.frequency.exponentialRampToValueAtTime(1400, now + duration * 0.6);
  lowpass.Q.setValueAtTime(0.7, now);

  const damper = ctx.createBiquadFilter();
  damper.type = 'highpass';
  damper.frequency.setValueAtTime(40, now);
  damper.Q.setValueAtTime(0.7, now);

  const gainMain = ctx.createGain();
  const gainShimmer = ctx.createGain();
  const gainBody = ctx.createGain();
  const masterGain = ctx.createGain();

  gainMain.gain.setValueAtTime(volume * 0.8, now);
  gainShimmer.gain.setValueAtTime(volume * 0.25, now);
  gainBody.gain.setValueAtTime(volume * 0.35, now);

  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(volume, now + 0.01);
  masterGain.gain.exponentialRampToValueAtTime(volume * 0.45, now + 0.25);
  masterGain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

  const panner = ctx.createStereoPanner();
  panner.pan.setValueAtTime(panPosition, now);

  oscMain.connect(gainMain);
  oscShimmer.connect(gainShimmer);
  oscBody.connect(gainBody);

  gainMain.connect(lowpass);
  gainShimmer.connect(lowpass);
  gainBody.connect(lowpass);
  lowpass.connect(damper);
  damper.connect(masterGain);
  masterGain.connect(panner);
  panner.connect(ctx.destination);

  oscMain.start(now);
  oscShimmer.start(now);
  oscBody.start(now);

  oscMain.stop(now + duration + 0.2);
  oscShimmer.stop(now + duration + 0.2);
  oscBody.stop(now + duration + 0.2);
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
    createPianoTone(ctx, frequency, duration, volume, panPosition);
    return;
  }

  createPluckedString(ctx, frequency, duration, volume, panPosition);
};
