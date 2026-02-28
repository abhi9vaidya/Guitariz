import * as Comlink from 'comlink';

const SEMITONE = 69;
const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const getNote = (freq: number, referenceA4: number) => {
    const rawNoteNum = 12 * (Math.log(freq / referenceA4) / Math.log(2)) + SEMITONE;
    const noteNum = Math.round(rawNoteNum);
    const difference = rawNoteNum - noteNum;
    const centsVal = Math.floor(difference * 100);
    const noteName = NOTE_STRINGS[noteNum % 12];
    const octaveVal = Math.floor(noteNum / 12) - 1;

    return { noteName, octaveVal, centsVal };
};

const autoCorrelate = (buffer: Float32Array, sampleRate: number) => {
    // RMS Volume Check
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);
    if (rms < 0.02) return -1; // Silence threshold

    // Find first dip and peak
    let r1 = 0, r2 = buffer.length - 1;
    const thres = 0.2;
    for (let i = 0; i < buffer.length / 2; i++) {
        if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < buffer.length / 2; i++) {
        if (Math.abs(buffer[buffer.length - i]) < thres) { r2 = buffer.length - i; break; }
    }

    const buff = buffer.slice(r1, r2);
    const c = new Float32Array(buff.length);
    for (let i = 0; i < buff.length; i++) {
        let sum = 0;
        for (let j = 0; j < buff.length - i; j++) {
            sum += buff[j] * buff[j + i];
        }
        c[i] = sum;
    }

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < buff.length; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }

    let T0 = maxpos;

    // Parabolic interpolation
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
};

export const detectPitch = (buffer: Float32Array, sampleRate: number, referenceA4: number) => {
    const ac = autoCorrelate(buffer, sampleRate);

    if (ac > -1 && ac > 50 && ac < 2000) {
        const { noteName, centsVal } = getNote(ac, referenceA4);
        return {
            freq: ac,
            noteName,
            centsVal,
            found: true
        };
    }
    return { found: false };
};

Comlink.expose({ detectPitch });
