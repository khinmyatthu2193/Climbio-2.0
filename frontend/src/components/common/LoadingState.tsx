export function LoadingState({ label = 'Loading…', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div className="p-5" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <div className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" key={index} />
        ))}
      </div>
    </div>
  );
}
