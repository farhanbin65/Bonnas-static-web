export default function LoadingSkeleton({ label = 'Loading page', className = '' }) {
  return (
    <div role="status" aria-label={label} className={`bg-night px-5 py-16 ${className}`}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="mx-auto max-w-7xl space-y-6">
        <div className="loading-skeleton h-8 w-48 max-w-full rounded-lg" />
        <div className="loading-skeleton h-4 w-80 max-w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="loading-skeleton aspect-[4/3] rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}
