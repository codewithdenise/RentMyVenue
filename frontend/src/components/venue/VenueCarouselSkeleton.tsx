import SkeletonCard from '../ui/SkeletonCard';


export default function VenueCarouselSkeleton() {
  return (
    <section className="flex gap-6 overflow-x-auto py-2 px-1 sm:px-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </section>
  );
}
