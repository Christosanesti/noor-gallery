import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="overflow-x-hidden">
      <div className="flex min-h-[80svh] flex-col justify-end px-4 pb-16 sm:justify-center sm:px-8">
        <Skeleton className="mb-4 h-7 w-40 rounded-full" />
        <Skeleton className="h-14 w-full max-w-xl sm:h-20" />
        <Skeleton className="mt-4 h-20 max-w-lg" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-11 w-36" />
          <Skeleton className="h-11 w-28" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <Skeleton className="mb-8 h-10 w-48" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
