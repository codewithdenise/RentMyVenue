export default function SkeletonCard() {
  return (
    <div className="animate-shimmer rounded-lg border border-gray-200 p-4 w-[280px] sm:w-[320px] bg-white relative overflow-hidden">
      <div className="h-36 w-full rounded-md bg-gray-200" />
      <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
      <div className="mt-6 h-8 w-full rounded bg-gray-200" />
    </div>
  );
}
