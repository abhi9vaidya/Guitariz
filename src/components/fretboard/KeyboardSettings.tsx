/**
 * Settings UI for configuring keyboard mappings
 */

import { useState } from 'react';
import { KeymapConfig, DEFAULT_KEYMAP } from '@/types/keyboardTypes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface KeyboardSettingsProps {
  keymap: KeymapConfig;
  strumSpeed: number;
  velocityProfile: 'linear' | 'exponential' | 'uniform';
  chordMode: boolean;
  onKeymapChange: (keymap: KeymapConfig) => void;
  onStrumSpeedChange: (speed: number) => void;
  onVelocityProfileChange: (profile: 'linear' | 'exponential' | 'uniform') => void;
  onChordModeChange: (enabled: boolean) => void;
}

export const KeyboardSettings = ({
  keymap,
  strumSpeed,
  velocityProfile,
  chordMode,
  onKeymapChange,
  onStrumSpeedChange,
  onVelocityProfileChange,
  onChordModeChange,
}: KeyboardSettingsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReset = () => {
    onKeymapChange(DEFAULT_KEYMAP);
    onStrumSpeedChange(30);
    onVelocityProfileChange('exponential');
    onChordModeChange(false);
    toast.success('Reset to defaults');
  };

  return (
    <Card className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">Keyboard Settings</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Chord Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="space-y-0.5">
              <Label htmlFor="chord-mode" className="text-sm font-semibold text-white">
                Chord Mode
              </Label>
              <p className="text-[11px] text-muted-foreground">Automatically strum on Enter key.</p>
            </div>
            <Switch
              id="chord-mode"
              checked={chordMode}
              onCheckedChange={onChordModeChange}
            />
          </div>

          {/* Strum Speed */}
          <div className="space-y-4 px-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="strum-speed" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Strum Speed
                </Label>
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded italic">{strumSpeed}ms</span>
              </div>
              <Slider
                id="strum-speed"
                min={10}
                max={100}
                step={5}
                value={[strumSpeed]}
                onValueChange={([value]) => onStrumSpeedChange(value)}
                className="py-2"
              />
            </div>

            {/* Velocity Profile */}
            <div className="space-y-3">
              <Label htmlFor="velocity-profile" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Velocity Profile
              </Label>
              <Select value={velocityProfile} onValueChange={onVelocityProfileChange}>
                <SelectTrigger id="velocity-profile" className="bg-white/5 border-white/10 hover:border-white/20 transition-colors h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uniform">Uniform</SelectItem>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="exponential">Exponential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset */}
          <div className="pt-2 border-t border-white/5">
            <Button variant="ghost" size="sm" onClick={handleReset} className="w-full text-muted-foreground hover:text-white gap-2 h-9">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
