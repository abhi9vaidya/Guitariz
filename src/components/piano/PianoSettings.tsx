/**
 * Piano keyboard settings panel
 * Configure keyboard layout and preferences
 */

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Keyboard, Piano, Settings2, Wind } from 'lucide-react';
import { KeyboardPreset } from '@/types/pianoTypes';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface PianoSettingsProps {
  keyboardPreset: KeyboardPreset;
  onKeyboardPresetChange: (preset: KeyboardPreset) => void;
  sustained: boolean;
  onSustainChange: () => void;
  onClear: () => void;
  octaveShift: number;
}

export const PianoSettings = ({
  keyboardPreset,
  onKeyboardPresetChange,
  sustained,
  onSustainChange,
  onClear,
  octaveShift,
}: PianoSettingsProps) => {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Piano className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">Piano Settings</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="h-8 gap-2 rounded-lg border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Clear</span>
        </Button>
      </div>

      <div className="space-y-6 flex-1">
        {/* Sustain Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 shadow-inner">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-white flex items-center gap-2">
              <Wind className="w-3 h-3 text-primary" />
              Pedal Sustain
            </Label>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Latching Mode</p>
          </div>
          <Switch
            checked={sustained}
            onCheckedChange={onSustainChange}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 w-fit">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Octave:</span>
          <span className="text-[10px] font-mono font-bold text-primary">
            {octaveShift > 0 ? `+${octaveShift}` : octaveShift}
          </span>
        </div>

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
