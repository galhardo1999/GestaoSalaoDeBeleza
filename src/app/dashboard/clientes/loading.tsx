export default function Loading() {
    return (
        <div className="p-8 space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-10 w-36 bg-muted animate-pulse rounded" />
            </div>

            {/* Filter Skeleton */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
            </div>

            {/* Table Skeleton */}
            <div className="rounded-lg border bg-card">
                <div className="p-4 space-y-3">
                    {/* Table Header */}
                    <div className="grid grid-cols-6 gap-4 pb-3 border-b">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded" />
                    </div>
                    {/* Table Rows */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-6 gap-4 py-3">
                            <div className="h-4 bg-muted animate-pulse rounded" />
                            <div className="h-4 bg-muted animate-pulse rounded" />
                            <div className="h-4 bg-muted animate-pulse rounded" />
                            <div className="h-4 bg-muted animate-pulse rounded" />
                            <div className="h-4 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-24 bg-muted animate-pulse rounded ml-auto" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                </div>
            </div>
        </div>
    )
}
