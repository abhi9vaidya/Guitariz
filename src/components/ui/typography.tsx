import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef, ElementType } from "react";

interface TypographyBaseProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  variant?: "display" | "heading" | "subheading" | "body" | "caption" | "overline";
  gradient?: boolean;
  animate?: boolean;
}

type TypographyProps = TypographyBaseProps & HTMLAttributes<HTMLElement>;

const variantStyles = {
  display: "text-6xl md:text-8xl font-display font-light tracking-tight leading-none",
  heading: "text-4xl md:text-6xl font-display font-light tracking-tight leading-tight",
  subheading: "text-2xl md:text-3xl font-display font-normal tracking-tight leading-snug",
  body: "text-base md:text-lg leading-relaxed",
  caption: "text-sm text-muted-foreground leading-normal",
  overline: "text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground",
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ as: Component = "p", variant = "body", gradient = false, animate = false, className, children, ...props }, ref) => {
    const Comp = Component as ElementType;
    return (
      <Comp
        ref={ref}
        className={cn(
          variantStyles[variant],
          gradient && "text-gradient",
          animate && "animate-fade-in-up",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Typography.displayName = "Typography";

// Convenience components
export const DisplayText = forwardRef<HTMLHeadingElement, Omit<TypographyBaseProps, "variant" | "as"> & HTMLAttributes<HTMLHeadingElement>>(
  (props, ref) => <Typography ref={ref} as="h1" variant="display" {...props} />
);
DisplayText.displayName = "DisplayText";

export const Heading = forwardRef<HTMLHeadingElement, Omit<TypographyBaseProps, "variant" | "as"> & HTMLAttributes<HTMLHeadingElement>>(
  (props, ref) => <Typography ref={ref} as="h2" variant="heading" {...props} />
);
Heading.displayName = "Heading";

export const Subheading = forwardRef<HTMLHeadingElement, Omit<TypographyBaseProps, "variant" | "as"> & HTMLAttributes<HTMLHeadingElement>>(
  (props, ref) => <Typography ref={ref} as="h3" variant="subheading" {...props} />
);
Subheading.displayName = "Subheading";

export const BodyText = forwardRef<HTMLParagraphElement, Omit<TypographyBaseProps, "variant" | "as"> & HTMLAttributes<HTMLParagraphElement>>(
  (props, ref) => <Typography ref={ref} as="p" variant="body" {...props} />
);
BodyText.displayName = "BodyText";

export const Caption = forwardRef<HTMLParagraphElement, Omit<TypographyBaseProps, "variant" | "as"> & HTMLAttributes<HTMLParagraphElement>>(
  (props, ref) => <Typography ref={ref} as="p" variant="caption" {...props} />
);
Caption.displayName = "Caption";

export const Overline = forwardRef<HTMLSpanElement, Omit<TypographyBaseProps, "variant" | "as"> & HTMLAttributes<HTMLSpanElement>>(
  (props, ref) => <Typography ref={ref} as="span" variant="overline" {...props} />
);
Overline.displayName = "Overline";
