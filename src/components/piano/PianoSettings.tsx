/**
 * Piano keyboard settings panel
 * Configure keyboard layout and preferences
 */

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Keyboard, Piano, Settings2 } from 'lucide-react';
import { KeyboardPreset } from '@/types/pianoTypes';

interface PianoSettingsProps {
  keyboardPreset: KeyboardPreset;
  onKeyboardPresetChange: (preset: KeyboardPreset) => void;
  octaveShift: number;
}

export const PianoSettings = ({
  keyboardPreset,
  onKeyboardPresetChange,
}: PianoSettingsProps) => {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Piano className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-white tracking-tight">Piano Settings</h3>
      </div>

      <div className="space-y-6 flex-1">
        {/* Keyboard Layout Preset */}
        <div className="space-y-3">
          <Label htmlFor="keyboard-preset" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Keyboard className="w-3 h-3" />
            Keyboard Layout
          </Label>
          <Select
            value={keyboardPreset}
            onValueChange={(value) => onKeyboardPresetChange(value as KeyboardPreset)}
          >
            <SelectTrigger id="keyboard-preset" className="bg-white/5 border-white/10 hover:border-white/20 transition-colors h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qwerty">QWERTY (Standard)</SelectItem>
              <SelectItem value="azerty">AZERTY</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground leading-relaxed italic">
            Choose layout for computer key mapping.
          </p>
        </div>

        {/* Key bindings info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest underline decoration-primary/30 underline-offset-4">Reference Guide</span>
          </div>
          
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { label: 'White keys', value: 'A S D F G H J K' },
              { label: 'Black keys', value: 'W E T Y U' },
              { label: 'Octave Shift', value: 'Z / X' },
              { label: 'Sustain', value: 'Space' },
            ].map((binding) => (
              <div key={binding.label} className="flex justify-between items-center group p-2 rounded-lg hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5">
                <span className="text-[11px] font-medium text-white/50">{binding.label}</span>
                <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded text-primary group-hover:bg-primary group-hover:text-black transition-colors">{binding.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
