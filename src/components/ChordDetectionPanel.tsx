/**
 * Chord detection display panel
 * Shows detected chords with confidence scores and alternatives
 */

import { ChordCandidate } from '@/types/chordDetectionTypes';
import { Music, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChordDetectionPanelProps {
  candidates: ChordCandidate[];
  selectedNotes: string[];
  onApplyChord?: (candidate: ChordCandidate) => void;
  className?: string;
}

import { motion, AnimatePresence } from 'framer-motion';

export const ChordDetectionPanel = ({
  candidates,
  selectedNotes,
  onApplyChord,
  className,
}: ChordDetectionPanelProps) => {
  if (selectedNotes.length === 0) {
    return (
      <div className={cn("text-center py-10", className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-xl"
        >
          <Music className="w-5 h-5 text-white/20" />
        </motion.div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-40">Ready to Analyze</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      <motion.div
        layout
        className="flex flex-col md:flex-row items-stretch gap-8"
      >
        {/* Main Identification */}
        <div className="flex-[1.5] flex flex-col justify-center text-center md:text-left space-y-2">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[9px] uppercase tracking-[0.3em] text-primary/80 font-black"
          >
            Detected Resonance
          </motion.p>

          <div className="flex flex-col md:flex-row md:items-baseline gap-4">
            <AnimatePresence mode="wait">
              <motion.h2
                key={candidates[0]?.name || 'nc'}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0, filter: "blur(4px)", y: -10 }}
                className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none glow-text"
              >
                {candidates[0]?.name || "N.C."}
              </motion.h2>
            </AnimatePresence>

            {candidates[0] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md w-fit mx-auto md:mx-0 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                  {Math.round(candidates[0].score)}% Fidelity
                </span>
              </motion.div>
            )}
          </div>

          {candidates[0]?.alternateNames && candidates[0].alternateNames.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2"
            >
              Interpretation: <span className="text-white/80">{candidates[0].alternateNames.join(' • ')}</span>
            </motion.p>
          )}
        </div>

        {/* Selected tones */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-4 flex items-center gap-3">
              Tonal Matrix <span className="h-[1px] flex-1 bg-white/10" />
            </p>

            <div className="flex flex-wrap gap-2 relative z-10">
              {selectedNotes.map((note, i) => (
                <motion.div
                  key={`${note}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[12px] font-black text-white hover:bg-primary/20 hover:border-primary/30 transition-all cursor-default shadow-lg backdrop-blur-sm"
                >
                  {note}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alternatives */}
      {candidates.length > 1 && (
        <div className="pt-8 space-y-4">
          <div className="flex items-center gap-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Alternative Perspectives</p>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {candidates.slice(1, 5).map((candidate, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="group p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/20 transition-all cursor-pointer shadow-xl backdrop-blur-md relative overflow-hidden"
                onClick={() => onApplyChord?.(candidate)}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-black text-white/90 group-hover:text-primary transition-colors tracking-tight">{candidate.name}</h4>
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{Math.round(candidate.score)}% Prob.</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
