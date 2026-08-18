import { CollectionFormSkeleton } from "@/components/admin/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewCollectionLoading() {
  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <CollectionFormSkeleton />
    </div>
  );
}
