import { notFound } from "next/navigation";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { getCollectionBySlug } from "@/lib/queries";

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "مجموعه یافت نشد" };
  return {
    title: collection.titleFa,
    description: collection.excerptFa ?? collection.descriptionFa.slice(0, 160),
  };
}

export default async function CollectionDetailPage({
  params,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  return (
    <div className="mx-auto max-w-7xl min-w-0 px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
      <Reveal className="space-y-8">
        <div data-reveal className="flex flex-wrap items-center gap-2">
          {collection.category ? <Badge variant="secondary">{collection.category.nameFa}</Badge> : null}
          {collection.featured ? <Badge className="bg-amber-400/15 text-amber-100">ویژه</Badge> : null}
        </div>

        <div data-reveal className="max-w-3xl">
          <h1 className="font-heading text-3xl font-semibold sm:text-4xl md:text-5xl">{collection.titleFa}</h1>
          {collection.excerptFa ? (
            <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">{collection.excerptFa}</p>
          ) : null}
          <div className="mt-6 whitespace-pre-line text-sm leading-8 text-muted-foreground sm:text-base sm:leading-9">
            {collection.descriptionFa}
          </div>
        </div>
      </Reveal>

      <div className="mt-10 sm:mt-14">
        <h2 className="font-heading mb-5 text-xl font-semibold sm:mb-7 sm:text-2xl">گالری تصاویر</h2>
        {collection.images.length ? (
          <GalleryGrid images={collection.images} featured />
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-12 text-center text-muted-foreground">
            هنوز تصویری برای این مجموعه ثبت نشده است.
          </div>
        )}
      </div>
    </div>
  );
}
