import Link from "next/link";
import { CollectionCard } from "@/components/gallery/collection-card";
import { Reveal } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeaturedCollections } from "@/lib/queries";

export async function FeaturedCollections() {
  const collections = await getFeaturedCollections();

  if (!collections.length) {
    return (
      <section className="featured-section mx-auto max-w-7xl min-w-0 px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground sm:p-10">
          هنوز مجموعه‌ای منتشر نشده است.
        </div>
      </section>
    );
  }

  return (
    <section className="featured-section mx-auto max-w-7xl min-w-0 px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4 sm:mb-12">
        <div>
          <p className="text-sm tracking-[0.16em] text-amber-300">منتخب نور گالری</p>
          <h2 className="font-heading mt-2 text-2xl font-semibold sm:text-3xl md:text-4xl">مجموعه‌های ویژه</h2>
        </div>
        <Link
          href="/collections"
          className="text-sm text-amber-200/80 transition-colors hover:text-amber-100"
        >
          مشاهده همه
        </Link>
      </div>
      <Reveal className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection) => (
          <div key={collection.id} data-reveal>
            <CollectionCard
              slug={collection.slug}
              titleFa={collection.titleFa}
              excerptFa={collection.excerptFa}
              imageUrl={collection.images[0]?.url}
              categoryName={collection.category?.nameFa}
              featured={collection.featured}
            />
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export function FeaturedCollectionsSkeleton() {
  return (
    <section className="mx-auto max-w-7xl min-w-0 px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <Skeleton className="mb-8 h-8 w-40 sm:mb-12 sm:h-10 sm:w-56" />
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />
        ))}
      </div>
    </section>
  );
}
