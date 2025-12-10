/**
 * Visual piano keyboard component
 * Displays interactive piano keys with active note highlighting
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  startOctave?: number;
  numOctaves?: number;
  activeNotes?: number[];
  onNoteClick?: (midiNote: number) => void;
  className?: string;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const midiToLabel = (midi: number) => {
  const note = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
};

// Generate piano keys for given range
const generateKeys = (startOctave: number, numOctaves: number) => {
  const keys: { midiNote: number; isBlack: boolean }[] = [];
  const blackKeys = new Set([1, 3, 6, 8, 10]);

  for (let octave = startOctave; octave < startOctave + numOctaves; octave++) {
    for (let note = 0; note < 12; note++) {
      const midiNote = (octave + 1) * 12 + note;
      keys.push({ midiNote, isBlack: blackKeys.has(note) });
    }
  }

  return keys;
};

export const PianoKeyboard = ({
  startOctave = 3,
  numOctaves = 2,
  activeNotes = [],
  onNoteClick,
  className,
}: PianoKeyboardProps) => {
  const WHITE_KEY_WIDTH = 46;
  const BLACK_KEY_WIDTH = 28;
  const KEY_HEIGHT = 176;

  const keys = useMemo(() => generateKeys(startOctave, numOctaves), [startOctave, numOctaves]);
  const activeNoteSet = useMemo(() => new Set(activeNotes), [activeNotes]);

  const whiteKeys = keys.filter(k => !k.isBlack);
  const blackKeys = keys.filter(k => k.isBlack);

  // Map midi note to its white-key index to position black keys accurately
  const whiteIndexByMidi = new Map<number, number>();
  whiteKeys.forEach((key, index) => {
    whiteIndexByMidi.set(key.midiNote, index);
  });

  return (
    <div
      className={cn("relative select-none", className)}
      role="group"
      aria-label="Piano keyboard"
      style={{
        width: whiteKeys.length * WHITE_KEY_WIDTH,
        height: KEY_HEIGHT,
      }}
    >
      {/* White keys */}
      <div className="flex">
        {whiteKeys.map((key) => {
          const active = activeNoteSet.has(key.midiNote);
          return (
            <button
              key={key.midiNote}
              onClick={() => onNoteClick?.(key.midiNote)}
              className={cn(
                "relative border border-border bg-gradient-to-b from-card to-muted/60 rounded-b-xl transition-all",
                "hover:shadow-md hover:-translate-y-[1px] active:translate-y-0",
                active && "from-primary/20 to-primary/40 border-primary/60 shadow-primary/30 shadow-lg"
              )}
              style={{ width: WHITE_KEY_WIDTH, height: KEY_HEIGHT }}
              aria-label={`Piano key ${midiToLabel(key.midiNote)}`}
              aria-pressed={active}
            >
              {active && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-tight text-muted-foreground">
                {midiToLabel(key.midiNote)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Black keys */}
      <div className="absolute top-0 left-0 pointer-events-none" style={{ height: KEY_HEIGHT * 0.68 }}>
        {blackKeys.map((key) => {
          const active = activeNoteSet.has(key.midiNote);
          const previousWhiteMidi = key.midiNote - 1;
          const whiteIndexBefore = whiteIndexByMidi.get(previousWhiteMidi);
          if (whiteIndexBefore === undefined) return null;

          const left = whiteIndexBefore * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH * 0.68;

          return (
            <button
              key={key.midiNote}
              onClick={() => onNoteClick?.(key.midiNote)}
              className={cn(
                "absolute pointer-events-auto rounded-b-md border border-border/50",
                "bg-gradient-to-b from-foreground to-foreground/90 shadow-md",
                "hover:brightness-110 active:translate-y-[1px]",
                active && "bg-primary border-primary/60 shadow-primary/40 shadow-lg"
              )}
              style={{
                left,
                width: BLACK_KEY_WIDTH,
                height: KEY_HEIGHT * 0.65,
              }}
              aria-label={`Piano key ${midiToLabel(key.midiNote)}`}
              aria-pressed={active}
            >
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-background/80">
                {midiToLabel(key.midiNote)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
