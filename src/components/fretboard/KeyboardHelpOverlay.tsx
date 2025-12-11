/**
 * Keyboard help overlay showing key bindings
 */

import { KeymapConfig } from '@/types/keyboardTypes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Keyboard } from 'lucide-react';

interface KeyboardHelpOverlayProps {
  keymap: KeymapConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelpOverlay = ({ keymap, isOpen, onClose }: KeyboardHelpOverlayProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="max-w-2xl w-full mx-4 p-6 glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h3 className="text-sm font-semibold text-primary mb-2">Quickstart</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Click frets or press the mapped keys to light notes.</li>
              <li>• Enter strums high to low, Shift+Enter strums low to high. Use chord mode to stack notes first.</li>
              <li>• '-' and '=' shift the octave. Use Clear on the fretboard to reset.</li>
            </ul>
          </div>

          {/* Note mappings */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Note Keys</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {keymap.notes.map((mapping) => (
                <div key={mapping.key} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <Badge variant="outline" className="font-mono uppercase">
                    {mapping.key}
                  </Badge>
                  <span className="text-sm font-medium">{mapping.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strum controls */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Strum Control</h3>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <Badge variant="outline" className="font-mono">
                {keymap.downStrum}
              </Badge>
              <span className="text-sm">Strum (High to Low)</span>
            </div>
          </div>

          {/* Octave controls */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Octave Shift</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <Badge variant="outline" className="font-mono">
                  {keymap.octaveUp}
                </Badge>
                <span className="text-sm">Shift Up (+12 frets)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <Badge variant="outline" className="font-mono">
                  {keymap.octaveDown}
                </Badge>
                <span className="text-sm">Shift Down (-12 frets)</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h4 className="font-semibold mb-2 text-primary">💡 Tips</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• In chord mode, hold notes, then press Enter or Shift+Enter to strum.</li>
              <li>• Keyboard input pauses automatically while typing in text fields.</li>
              <li>• Customize key bindings and strum feel in the settings panel.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Got it!</Button>
        </div>
      </Card>
    </div>
  );
};
