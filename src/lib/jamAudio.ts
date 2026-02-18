/**
 * Jam Studio Audio Engine
 * 
 * Purpose-built for looping chord progressions with warm, musical tones.
 * Uses Web Audio API scheduling for sample-accurate timing.
 */

// ─── Note Frequencies (4th octave) ──────────────────────────────────────────
const NOTE_FREQ: Record<string, number> = {
    "C": 261.63, "C#": 277.18, "Db": 277.18,
    "D": 293.66, "D#": 311.13, "Eb": 311.13,
    "E": 329.63,
    "F": 349.23, "F#": 369.99, "Gb": 369.99,
    "G": 392.00, "G#": 415.30, "Ab": 415.30,
    "A": 440.00, "A#": 466.16, "Bb": 466.16,
    "B": 493.88,
};

// ─── Chord intervals in semitones ───────────────────────────────────────────
const CHORD_INTERVALS: Record<string, number[]> = {
    "Major": [0, 4, 7],
    "Minor": [0, 3, 7],
    "7": [0, 4, 7, 10],
    "maj7": [0, 4, 7, 11],
    "m7": [0, 3, 7, 10],
    "sus4": [0, 5, 7],
    "sus2": [0, 2, 7],
    "dim": [0, 3, 6],
    "aug": [0, 4, 8],
    "add9": [0, 4, 7, 14],
    "6": [0, 4, 7, 9],
    "m6": [0, 3, 7, 9],
};

// ─── Audio context singleton ────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 1.0;
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

function getMasterGain(): GainNode {
    getAudioContext();
    return masterGain!;
}

// ─── Chord to frequencies ───────────────────────────────────────────────────
export function chordToFrequencies(root: string, variant: string): number[] {
    const rootFreq = NOTE_FREQ[root];
    if (!rootFreq) return [];

    const intervals = CHORD_INTERVALS[variant] || CHORD_INTERVALS["Major"];

    // Build chord voiced across octaves for richness:
    // - Bass note one octave down
    // - Mid voices at root octave
    // - Optional upper extension
    const freqs: number[] = [];

    // Bass note (one octave below root)
    freqs.push(rootFreq / 2);

    // Main chord tones at root octave
    for (const semitone of intervals) {
        freqs.push(rootFreq * Math.pow(2, semitone / 12));
    }

    return freqs;
}

// ─── Electric Piano Tone ────────────────────────────────────────────────────
// Rhodes-style: warm sine fundamental, soft harmonics, gentle bell-like quality
function playWarmPianoNote(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    startTime: number,
    duration: number,
    volume: number,
    pan: number = 0,
) {
    const noteGain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, startTime);

    noteGain.connect(panner);
    panner.connect(dest);

    // Rhodes-style envelope: quick but not harsh attack, smooth decay into sustain
    const attack = 0.012;
    const decay = 0.4;
    const sustainLevel = 0.45;
    const release = Math.min(0.5, duration * 0.3);
    const sustainEnd = startTime + duration - release;

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(volume, startTime + attack);
    noteGain.gain.exponentialRampToValueAtTime(Math.max(volume * sustainLevel, 0.001), startTime + attack + decay);
    if (sustainEnd > startTime + attack + decay) {
        noteGain.gain.setValueAtTime(volume * sustainLevel, sustainEnd);
    }
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // Layer 1: Sine fundamental — warm, clean base tone
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, startTime);
    osc1.connect(noteGain);
    osc1.start(startTime);
    osc1.stop(startTime + duration + 0.05);

    // Layer 2: Soft 2nd harmonic — adds body, gentle decay
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(volume * 0.18, startTime);
    osc2Gain.gain.exponentialRampToValueAtTime(volume * 0.04, startTime + 0.8);
    osc2.connect(osc2Gain);
    osc2Gain.connect(noteGain);
    osc2.start(startTime);
    osc2.stop(startTime + duration + 0.05);

    // Layer 3: Very soft 3rd harmonic — subtle bell-like character
    const osc3 = ctx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(freq * 3, startTime);
    const osc3Gain = ctx.createGain();
    osc3Gain.gain.setValueAtTime(volume * 0.06, startTime);
    osc3Gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
    osc3.connect(osc3Gain);
    osc3Gain.connect(noteGain);
    osc3.start(startTime);
    osc3.stop(startTime + duration + 0.05);
}

// ─── Warm Pad Tone ──────────────────────────────────────────────────────────
// Detunded sine layers for a lush, ambient pad sound
function playPadNote(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    startTime: number,
    duration: number,
    volume: number,
    pan: number = 0,
) {
    const noteGain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, startTime);

    noteGain.connect(panner);
    panner.connect(dest);

    // Slow attack, long sustain, gentle release — typical pad
    const attack = 0.15;
    const release = Math.min(0.6, duration * 0.35);
    const sustainEnd = startTime + duration - release;

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(volume, startTime + attack);
    noteGain.gain.setValueAtTime(volume, Math.max(startTime + attack, sustainEnd));
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // Three slightly detuned sines for warm chorus effect
    const detune = [0, -6, 6]; // cents
    for (const d of detune) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        osc.detune.setValueAtTime(d, startTime);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(volume * 0.35, startTime);
        osc.connect(oscGain);
        oscGain.connect(noteGain);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
    }
}

// ─── Public: Schedule a chord ───────────────────────────────────────────────
export type JamInstrument = "piano" | "pad";

export function scheduleChord(
    root: string,
    variant: string,
    startTime: number,
    duration: number,
    volume: number = 0.3,
    instrument: JamInstrument = "piano",
): void {
    const ctx = getAudioContext();
    const dest = getMasterGain();
    const freqs = chordToFrequencies(root, variant);
    if (freqs.length === 0) return;

    // Scale individual note volume based on number of notes to avoid clipping
    const noteVol = (volume * 0.5) / Math.sqrt(freqs.length);

    const playFn = instrument === "pad" ? playPadNote : playWarmPianoNote;

    freqs.forEach((freq, i) => {
        // Spread notes across stereo field
        const pan = (i / Math.max(freqs.length - 1, 1)) * 0.6 - 0.3;
        playFn(ctx, dest, freq, startTime, duration, noteVol, pan);
    });
}

// ─── Public: Metronome click ────────────────────────────────────────────────
export function scheduleClick(startTime: number, accent: boolean = false): void {
    const ctx = getAudioContext();
    const dest = getMasterGain();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(accent ? 1000 : 700, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(accent ? 0.08 : 0.04, startTime + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(startTime);
    osc.stop(startTime + 0.07);
}

// ─── Public: Get current audio time ─────────────────────────────────────────
export function getAudioTime(): number {
    return getAudioContext().currentTime;
}

// ─── Public: Set master volume ──────────────────────────────────────────────
export function setMasterVolume(vol: number): void {
    const gain = getMasterGain();
    gain.gain.setValueAtTime(vol, getAudioContext().currentTime);
}
