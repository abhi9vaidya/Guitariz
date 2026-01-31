import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export const LoadingSpinner = ({ size = "md", className, text }: LoadingSpinnerProps) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <Loader2 className={cn("animate-spin text-white/60", sizeClasses[size], className)} />
    {text && (
      <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
    )}
  </div>
);

interface LoadingBarProps {
  progress?: number;
  className?: string;
  showPercentage?: boolean;
}

export const LoadingBar = ({ progress, className, showPercentage = false }: LoadingBarProps) => (
  <div className="space-y-2">
    <div className={cn("h-2 bg-white/5 rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out animate-shimmer"
        style={{
          width: progress ? `${progress}%` : "100%",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
    {showPercentage && progress !== undefined && (
      <p className="text-xs text-muted-foreground text-center font-mono">
        {Math.round(progress)}%
      </p>
    )}
  </div>
);

export const LoadingDots = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-1", className)}>
    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
  </div>
);

export const LoadingPulse = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-ping" />
      <div className="absolute inset-2 border-4 border-white/40 rounded-full animate-pulse" />
      <div className="absolute inset-4 border-4 border-white/60 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
    </div>
  </div>
);

interface SkeletonProps {
  className?: string;
  lines?: number;
  variant?: "text" | "card" | "circle" | "thumbnail";
}

export const Skeleton = ({ className, lines = 1, variant = "text" }: SkeletonProps) => {
  if (variant === "circle") {
    return <div className={cn("rounded-full bg-white/5 animate-pulse", className)} />;
  }

  if (variant === "thumbnail") {
    return <div className={cn("rounded-xl bg-white/5 animate-pulse aspect-video", className)} />;
  }

  if (variant === "card") {
    return (
      <div className={cn("rounded-2xl bg-white/5 animate-pulse p-6 space-y-3", className)}>
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded" />
        <div className="h-3 bg-white/5 rounded w-5/6" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-white/5 rounded animate-pulse"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
};

interface LoadingOverlayProps {
  show: boolean;
  text?: string;
  className?: string;
}

export const LoadingOverlay = ({ show, text, className }: LoadingOverlayProps) => {
  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in",
        className
      )}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-scale-in-large">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

export const ProgressRing = ({ progress = 0, size = 120 }: { progress?: number; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="white"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute text-xl font-bold text-white font-mono">
        {Math.round(progress)}%
      </div>
    </div>
  );
};
