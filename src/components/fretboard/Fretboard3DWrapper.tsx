/**
 * Fretboard3DWrapper — Lazy-loaded wrapper for the 3D fretboard.
 *
 * Loads Three.js bundle only when the user activates the 3D view,
 * keeping the initial page load fast.
 */

import { lazy, Suspense } from "react";
import type { FretNote } from "./Fretboard3D";

const Fretboard3DLazy = lazy(() => import("./Fretboard3D"));

interface Fretboard3DWrapperProps {
    highlightedNotes: FretNote[];
    scaleContext?: {
        enabled: boolean;
        rootIndex: number;
        pcs: Set<number>;
    };
    onNoteClick?: (stringIndex: number, fret: number) => void;
}

function LoadingSkeleton() {
    return (
        <div className="w-full h-[500px] md:h-[600px] rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center relative overflow-hidden">
            {/* Animated shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />

            <div className="flex flex-col items-center gap-4 z-10">
                {/* Guitar icon outline */}
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-white/30 animate-pulse"
                        >
                            <rect x="2" y="8" width="20" height="8" rx="1" />
                            <line x1="6" y1="8" x2="6" y2="16" />
                            <line x1="10" y1="8" x2="10" y2="16" />
                            <line x1="14" y1="8" x2="14" y2="16" />
                            <line x1="18" y1="8" x2="18" y2="16" />
                        </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-sm font-medium text-white/50">Loading 3D Fretboard</p>
                    <p className="text-[11px] text-white/30 mt-1">Initializing Three.js engine...</p>
                </div>

                {/* Progress bar */}
                <div className="w-48 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary/60 to-primary/20 rounded-full animate-loading-bar" />
                </div>
            </div>
        </div>
    );
}

export default function Fretboard3DWrapper(props: Fretboard3DWrapperProps) {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <Fretboard3DLazy {...props} />
        </Suspense>
    );
}
