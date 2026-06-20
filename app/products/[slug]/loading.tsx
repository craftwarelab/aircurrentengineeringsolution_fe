export default function ProductLoading() {
  return (
    <div className="bg-background min-h-screen animate-pulse">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-4 w-10 bg-muted rounded" />
          <div className="h-4 w-2 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-2 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image gallery skeleton */}
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-muted aspect-square w-full" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 w-16 rounded-xl bg-muted flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="flex flex-col gap-5">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-muted rounded-full" />
              <div className="h-6 w-20 bg-muted rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-5 w-1/3 bg-muted rounded" />
            </div>
            <div className="h-10 w-1/2 bg-muted rounded" />
            <div className="h-4 w-2/5 bg-muted rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-5/6 bg-muted rounded" />
              <div className="h-4 w-4/6 bg-muted rounded" />
            </div>
            <div className="rounded-xl border border-border p-4 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded" />
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-12 flex-1 bg-muted rounded-xl" />
              <div className="h-12 flex-1 bg-muted rounded-xl" />
            </div>
          </div>
        </div>

        {/* Description skeleton */}
        <div className="mt-16 border-t border-border pt-10 space-y-3">
          <div className="h-7 w-48 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-4/6 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
