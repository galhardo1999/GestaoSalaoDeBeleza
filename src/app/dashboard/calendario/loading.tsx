export default function Loading() {
    return (
        <div className="p-8 h-full space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-56 bg-muted animate-pulse rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                </div>
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-wrap gap-4">
                <div className="h-10 w-[200px] bg-muted animate-pulse rounded" />
                <div className="h-10 w-[180px] bg-muted animate-pulse rounded" />
            </div>

            {/* Calendar Grid Skeleton */}
            <div className="rounded-lg border bg-card p-4">
                {/* Week Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="h-8 bg-muted animate-pulse rounded text-center" />
                    ))}
                </div>
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="h-24 bg-muted animate-pulse rounded" />
                    ))}
                </div>
            </div>
        </div>
    )
}
