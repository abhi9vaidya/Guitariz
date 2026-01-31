import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface AnimatedContainerProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
  stagger?: boolean;
}

export const FadeIn = ({ delay = 0, className, children, ...props }: AnimatedContainerProps) => (
  <div
    className={cn("animate-fade-in-up", className)}
    style={{ animationDelay: `${delay}ms` }}
    {...props}
  >
    {children}
  </div>
);

export const SlideIn = ({ delay = 0, className, children, ...props }: AnimatedContainerProps) => (
  <div
    className={cn("animate-slide-in", className)}
    style={{ animationDelay: `${delay}ms` }}
    {...props}
  >
    {children}
  </div>
);

export const ScaleIn = ({ delay = 0, className, children, ...props }: AnimatedContainerProps) => (
  <div
    className={cn("animate-scale-in-large", className)}
    style={{ animationDelay: `${delay}ms` }}
    {...props}
  >
    {children}
  </div>
);

export const StaggerContainer = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-4", className)} {...props}>
    {children}
  </div>
);

export const StaggerItem = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("stagger-item", className)} {...props}>
    {children}
  </div>
);

export const Float = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-float", className)} {...props}>
    {children}
  </div>
);

export const Shimmer = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("shimmer-effect", className)} {...props}>
    {children}
  </div>
);

export const PulseGlow = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-glow-pulse", className)} {...props}>
    {children}
  </div>
);

interface InteractiveCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: "lift" | "glow" | "scale";
}

export const InteractiveCard = ({ hover = "lift", className, children, ...props }: InteractiveCardProps) => {
  const hoverClass = {
    lift: "hover-lift",
    glow: "hover-glow",
    scale: "hover-scale",
  }[hover];

  return (
    <div className={cn("card-interactive", hoverClass, className)} {...props}>
      {children}
    </div>
  );
};

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("skeleton rounded-xl", className)} {...props} />
);
