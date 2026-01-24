import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GuitarizLoaderProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    text?: string;
    fullScreen?: boolean;
}

const GuitarizLoader = ({
    size = "lg",
    className,
    text,
    fullScreen = false
}: GuitarizLoaderProps) => {

    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-16 h-16",
        xl: "w-24 h-24"
    };

    const content = (
        <div className={cn("flex flex-col items-center justify-center gap-6 relative z-50", className)}>
            <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
                {/* Subtle Backdrop Glow */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-white/5 blur-xl"
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Clean Logo */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white w-full h-full drop-shadow-lg"
                >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>

                {/* Minimalist Spinner Ring */}
                <motion.div
                    className="absolute -inset-4 border border-white/10 rounded-full border-t-white/40"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {text && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-medium">
                        {text}
                    </span>
                </motion.div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-[9999]">
                {content}
            </div>
        );
    }

    return content;
};

export default GuitarizLoader;
