interface SkeletonProps { className?: string; }

export function Skeleton({ className = '' }: SkeletonProps) {
    return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SkeletonText({ lines = 2, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`} aria-hidden="true">
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-3/5' : 'w-full'}`} />
            ))}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="flex flex-col gap-3" aria-hidden="true">
            <Skeleton className="aspect-[3/4] w-full" />
            <SkeletonText lines={2} />
        </div>
    );
}
