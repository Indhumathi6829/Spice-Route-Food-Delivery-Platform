export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-3 w-12" />
          <div className="skeleton h-3 w-14" />
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}
