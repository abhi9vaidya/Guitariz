/**
 * Custom hook for keyboard-integrated fretboard controls
 * Maps keyboard input to note playback with strum support
 */

import { useEffect, useRef, useCallback } from 'react';
import { KeyboardFretboardOptions, FretPosition } from '@/types/keyboardTypes';
import { playNote } from '@/lib/chordAudio';

const GUITAR_TUNING = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41]; // E A D G B e

const getNoteFrequency = (position: FretPosition): number => {
  const stringFreq = GUITAR_TUNING[position.string];
  return stringFreq * Math.pow(2, position.fret / 12);
};

export const useKeyboardFretboard = (options: KeyboardFretboardOptions) => {
  const {
    enabled,
    keymap,
    strumSpeed = 30,
    velocityProfile = 'exponential',
    chordMode = false,
    onNoteOn,
    onNoteOff,
    onStrumDown,
    onStrumUp,
  } = options;

  const pressedKeys = useRef<Set<string>>(new Set());
  const activeNotes = useRef<Map<string, FretPosition>>(new Map());
  const keyDebounce = useRef<Map<string, number>>(new Map());
  const octaveShift = useRef<number>(0);

  const getVelocity = useCallback((index: number, total: number): number => {
    const position = index / Math.max(total - 1, 1);

    switch (velocityProfile) {
      case 'linear':
        return 0.2 + position * 0.3;
      case 'exponential':
        return 0.2 + Math.pow(position, 1.5) * 0.3;
      case 'uniform':
      default:
        return 0.3;
    }
  }, [velocityProfile]);

  const strumDown = useCallback(() => {
    if (!enabled) return;

    onStrumDown?.();

    // Get currently pressed notes or chord mode positions
    const positions = Array.from(activeNotes.current.values());

    if (positions.length === 0) return;

    // Sort by string (low to high: 5→0)
    const sorted = [...positions].sort((a, b) => b.string - a.string);

    sorted.forEach((position, index) => {
      setTimeout(() => {
        const freq = getNoteFrequency(position);
        const velocity = getVelocity(index, sorted.length);
        playNote(freq, 1.5, velocity);
      }, index * strumSpeed);
    });
  }, [enabled, strumSpeed, getVelocity, onStrumDown]);

  const strumUp = useCallback(() => {
    if (!enabled) return;

    onStrumUp?.();

    const positions = Array.from(activeNotes.current.values());

    if (positions.length === 0) return;

    // Sort by string (high to low: 0→5)
    const sorted = [...positions].sort((a, b) => a.string - b.string);

    sorted.forEach((position, index) => {
      setTimeout(() => {
        const freq = getNoteFrequency(position);
        const velocity = getVelocity(index, sorted.length);
        playNote(freq, 1.5, velocity);
      }, index * strumSpeed);
    });
  }, [enabled, strumSpeed, getVelocity, onStrumUp]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if focused in input fields
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = e.key.toLowerCase();

    // Handle strum keys
    if (e.code === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        strumUp();
      } else {
        strumDown();
      }
      return;
    }

    // Handle octave shift
    if (key === '=') {
      e.preventDefault();
      octaveShift.current = Math.min(octaveShift.current + 1, 3);
      return;
    }
    if (key === '-') {
      e.preventDefault();
      octaveShift.current = Math.max(octaveShift.current - 1, -3);
      return;
    }

    // Handle note keys from keymap
    const noteMapping = keymap.notes.find(m => m.key === key);
    if (noteMapping) {
      e.preventDefault();
      
      if (chordMode) {
        // In chord mode, only strum on Enter - just track the position
        const fret = noteMapping.position.fret + octaveShift.current * 12;
        const position = { ...noteMapping.position, fret };
        activeNotes.current.set(key, position);
        pressedKeys.current.add(key);
        onNoteOn?.(noteMapping.note, 0.5, position);
      } else {
        // In normal mode, play immediately
        const fret = noteMapping.position.fret + octaveShift.current * 12;
        const position = { ...noteMapping.position, fret };
        const freq = getNoteFrequency(position);
        playNote(freq, 0.8, 0.5);
        activeNotes.current.set(key, position);
        pressedKeys.current.add(key);
        onNoteOn?.(noteMapping.note, 0.5, position);
      }
      return;
    }
  }, [enabled, keymap, chordMode, strumDown, strumUp]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = e.key.toLowerCase();
    
    // Clear note from active notes and pressed keys
    const noteMapping = keymap.notes.find(m => m.key === key);
    if (noteMapping) {
      const fret = noteMapping.position.fret + octaveShift.current * 12;
      const position = { ...noteMapping.position, fret };
      activeNotes.current.delete(key);
      pressedKeys.current.delete(key);
      onNoteOff?.(noteMapping.note, position);
    }
  }, [enabled, keymap]);

  useEffect(() => {
    if (!enabled) {
      pressedKeys.current.clear();
      activeNotes.current.clear();
      return;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, handleKeyDown, handleKeyUp]);

  return {
    pressedKeys: Array.from(pressedKeys.current),
    activeNotes: Array.from(activeNotes.current.entries()),
    octaveShift: octaveShift.current,
    strumDown,
    strumUp,
  };
};
