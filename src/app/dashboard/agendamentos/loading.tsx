export default function Loading() {
    return (
        <div className="p-8 space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-40 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-72 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-10 w-44 bg-muted animate-pulse rounded" />
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-10 w-[200px] bg-muted animate-pulse rounded" />
                <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
                <div className="h-10 w-[180px] bg-muted animate-pulse rounded" />
                <div className="h-10 w-[240px] bg-muted animate-pulse rounded" />
            </div>

            {/* Table Skeleton */}
            <div className="rounded-lg border bg-card">
                <div className="p-4 space-y-3">
                    {/* Table Header */}
                    <div className="grid grid-cols-8 gap-4 pb-3 border-b">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded col-span-2" />
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded" />
                    </div>
                    {/* Table Rows */}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-8 gap-4 py-3">
                            <div className="h-4 bg-muted animate-pulse rounded" />
                            <div className="h-4 bg-muted animate-pulse rounded" />
                            <div className="h-4 bg-muted animate-pulse rounded col-span-2" />
                            <div className="h-4 bg-muted animate-pulse rounded" />
                            <div className="h-4 bg-muted animate-pulse rounded" />
                            <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                            <div className="flex gap-1 justify-end">
                                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                </div>
            </div>
        </div>
    )
}
