export function ClientesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-slate-100 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
            <div className="h-6 w-24 bg-slate-100 rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="h-2.5 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-full" />
              </div>
              <div className="space-y-1">
                <div className="h-2.5 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-full" />
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <div className="h-2.5 bg-slate-100 rounded w-24" />
            <div className="flex gap-0.5">
              {Array(5).fill(0).map((_, j) => <div key={j} className="w-5 h-1.5 bg-slate-100 rounded-full" />)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
