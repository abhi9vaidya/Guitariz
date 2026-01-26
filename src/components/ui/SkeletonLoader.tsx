import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-white/5 relative overflow-hidden",
                "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent",
                className
            )}
            {...props}
        />
    );
}

export function ChordAISkeleton() {
    return (
        <div className="space-y-8 p-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Skeleton className="w-16 h-16 rounded-3xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-9 w-24 rounded-xl" />
                    <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
            </div>

            <div className="space-y-10">
                <div className="space-y-4">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-40 w-full rounded-3xl" />
                </div>
                <div className="space-y-12">
                    <div className="space-y-4">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-20 w-full rounded-[2rem]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
