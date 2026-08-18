import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-8 sm:py-16">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-12 w-64" />
      <Skeleton className="aspect-video w-full rounded-[2rem]" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
