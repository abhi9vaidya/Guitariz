import { Chord, Note } from "tonal";

/**
 * Transposes a chord name by a number of semitones.
 * @param chordName The chord name (e.g., "Cmaj7", "F#m")
 * @param semitones The number of semitones to transpose (e.g., 2, -1)
 * @returns The transposed chord name
 */
export const transposeChord = (chordName: string, semitones: number): string => {
  if (semitones === 0) return chordName;
  if (!chordName || chordName === "N.C.") return chordName;

  try {
    const chord = Chord.get(chordName);
    if (!chord.tonic) {
      // Fallback for simple parsing if Tonal fails to find a tonic
      const rootMatch = chordName.match(/^[A-G][#b]?/);
      if (!rootMatch) return chordName;
      const root = rootMatch[0];
      const suffix = chordName.slice(root.length);
      const newRoot = transposeNote(root, semitones);
      return newRoot + suffix;
    }

    const newTonic = transposeNote(chord.tonic, semitones);
    
    // Handle slash chords (e.g., C/G)
    // tonal's Chord.get returns the bass note if it exists
    let result = chordName;
    if (chordName.startsWith(chord.tonic)) {
        result = newTonic + chordName.slice(chord.tonic.length);
    } else {
        result = newTonic + chord.aliases[0];
    }

    // Now transpose the bass part if it's a slash chord
    if (result.includes("/")) {
        const parts = result.split("/");
        if (parts.length === 2 && chord.bass) {
            const newBass = transposeNote(chord.bass, semitones);
            return parts[0] + "/" + newBass;
        }
    }
    
    return result;
  } catch (e) {
    return chordName;
  }
};

/**
 * Transposes a key signature.
 * @param key The key (e.g., "C", "F#")
 * @param semitones The number of semitones to transpose
 * @returns The transposed key
 */
export const transposeKey = (key: string, semitones: number): string => {
    if (semitones === 0) return key;
    if (!key) return key;
    return transposeNote(key, semitones);
}

/**
 * Helper to transpose a note by semitones using MIDI numbers.
 */
const transposeNote = (note: string, semitones: number): string => {
    const midi = Note.midi(note + "4"); // Add octave to ensure valid MIDI
    if (midi === null) return note;
    
    const newMidi = midi + semitones;
    const newNote = Note.fromMidi(newMidi);
    
    // Note.fromMidi returns "C4", "Db4", etc.
    // We need to remove the octave.
    return newNote.replace(/\d+$/, "");
}
