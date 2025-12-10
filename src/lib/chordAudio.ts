/**
 * WebAudio utility for playing chord sounds
 * Generates guitar-like tones for chord playback
 */

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

const GUITAR_TUNING = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41]; // E A D G B e

export const playChord = (frets: number[], volume: number = 0.3): void => {
  const ctx = initAudioContext();

  const now = ctx.currentTime;
  const attackTime = 0.005;
  const decayTime = 0.1;
  const releaseTime = 2.0;

  frets.forEach((fret, stringIndex) => {
    if (fret === -1) return; // Muted string

    const stringFreq = GUITAR_TUNING[stringIndex];
    const noteFreq = stringFreq * Math.pow(2, fret / 12);

    // Create more realistic guitar tone with harmonics
    const fundamental = ctx.createOscillator();
    const harmonic2 = ctx.createOscillator();
    const harmonic3 = ctx.createOscillator();
    
    const masterGain = ctx.createGain();
    const fundamentalGain = ctx.createGain();
    const harmonic2Gain = ctx.createGain();
    const harmonic3Gain = ctx.createGain();
    
    // Low-pass filter for warmer tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000 - stringIndex * 300, now);
    filter.Q.setValueAtTime(1, now);

    // Fundamental frequency with triangle wave
    fundamental.type = 'triangle';
    fundamental.frequency.setValueAtTime(noteFreq, now);
    fundamentalGain.gain.setValueAtTime(0.6, now);
    
    // Second harmonic (octave)
    harmonic2.type = 'sine';
    harmonic2.frequency.setValueAtTime(noteFreq * 2, now);
    harmonic2Gain.gain.setValueAtTime(0.15, now);
    
    // Third harmonic
    harmonic3.type = 'sine';
    harmonic3.frequency.setValueAtTime(noteFreq * 3, now);
    harmonic3Gain.gain.setValueAtTime(0.08, now);

    // ADSR envelope with realistic guitar decay
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + attackTime);
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.6, now + attackTime + decayTime);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);

    // Connect oscillators
    fundamental.connect(fundamentalGain);
    harmonic2.connect(harmonic2Gain);
    harmonic3.connect(harmonic3Gain);
    
    fundamentalGain.connect(filter);
    harmonic2Gain.connect(filter);
    harmonic3Gain.connect(filter);
    
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    const startTime = now + stringIndex * 0.02;
    fundamental.start(startTime);
    harmonic2.start(startTime);
    harmonic3.start(startTime);
    
    fundamental.stop(startTime + releaseTime);
    harmonic2.stop(startTime + releaseTime);
    harmonic3.stop(startTime + releaseTime);
  });
};

export const playNote = (frequency: number, duration: number = 1.5, volume: number = 0.3): void => {
  const ctx = initAudioContext();

  const now = ctx.currentTime;
  const attackTime = 0.005;
  const decayTime = 0.1;
  
  // Create realistic guitar tone with harmonics
  const fundamental = ctx.createOscillator();
  const harmonic2 = ctx.createOscillator();
  const harmonic3 = ctx.createOscillator();
  
  const masterGain = ctx.createGain();
  const fundamentalGain = ctx.createGain();
  const harmonic2Gain = ctx.createGain();
  const harmonic3Gain = ctx.createGain();
  
  // Low-pass filter for guitar-like warmth
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2500, now);
  filter.Q.setValueAtTime(1.5, now);

  // Set up oscillators with harmonics
  fundamental.type = 'triangle';
  fundamental.frequency.setValueAtTime(frequency, now);
  fundamentalGain.gain.setValueAtTime(0.6, now);
  
  harmonic2.type = 'sine';
  harmonic2.frequency.setValueAtTime(frequency * 2, now);
  harmonic2Gain.gain.setValueAtTime(0.15, now);
  
  harmonic3.type = 'sine';
  harmonic3.frequency.setValueAtTime(frequency * 3, now);
  harmonic3Gain.gain.setValueAtTime(0.08, now);

  // ADSR envelope
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(volume, now + attackTime);
  masterGain.gain.exponentialRampToValueAtTime(volume * 0.6, now + attackTime + decayTime);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  // Connect the audio graph
  fundamental.connect(fundamentalGain);
  harmonic2.connect(harmonic2Gain);
  harmonic3.connect(harmonic3Gain);
  
  fundamentalGain.connect(filter);
  harmonic2Gain.connect(filter);
  harmonic3Gain.connect(filter);
  
  filter.connect(masterGain);
  masterGain.connect(ctx.destination);

  fundamental.start(now);
  harmonic2.start(now);
  harmonic3.start(now);
  
  fundamental.stop(now + duration);
  harmonic2.stop(now + duration);
  harmonic3.stop(now + duration);
};
