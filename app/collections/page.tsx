import Link from "next/link";
import { Suspense } from "react";
import { CollectionCard } from "@/components/gallery/collection-card";
import { Reveal } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories, getPublishedCollections } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "مجموعه‌ها",
};

async function CollectionsContent({
  categorySlug,
}: {
  categorySlug?: string;
}) {
  const [categories, collections] = await Promise.all([
    getCategories(),
    getPublishedCollections(categorySlug),
  ]);

  return (
    <>
      <div className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
        <Link
          href="/collections"
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
            !categorySlug
              ? "bg-amber-400/15 text-amber-100"
              : "bg-white/5 text-muted-foreground hover:text-foreground",
          )}
        >
          همه
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/collections?category=${category.slug}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
              categorySlug === category.slug
                ? "bg-amber-400/15 text-amber-100"
                : "bg-white/5 text-muted-foreground hover:text-foreground",
            )}
          >
            {category.nameFa}
          </Link>
        ))}
      </div>

      {collections.length ? (
        <Reveal className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
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
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-white/10 p-10 text-center text-muted-foreground">
          مجموعه‌ای در این دسته یافت نشد.
        </div>
      )}
    </>
  );
}

function CollectionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default async function CollectionsPage({
  searchParams,
}: PageProps<"/collections">) {
  const params = await searchParams;
  const categorySlug =
    typeof params.category === "string" ? params.category : undefined;

  return (
    <div className="mx-auto max-w-7xl min-w-0 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-8 max-w-2xl sm:mb-12">
        <p className="text-sm tracking-[0.16em] text-amber-300">گالری محصولات</p>
        <h1 className="font-heading mt-2 text-3xl font-semibold sm:text-4xl md:text-5xl">مجموعه‌های نور گالری</h1>
        <p className="mt-4 text-sm leading-8 text-muted-foreground sm:text-base">
          مجموعه‌ای از لوستر، لامپ و روشنایی معماری با توضیحات کامل و گالری تصاویر.
        </p>
      </div>
      <Suspense fallback={<CollectionsSkeleton />}>
        <CollectionsContent categorySlug={categorySlug} />
      </Suspense>
    </div>
  );
}
