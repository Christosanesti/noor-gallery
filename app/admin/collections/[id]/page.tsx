import { notFound } from "next/navigation";
import { CollectionForm } from "@/components/admin/collection-form";
import { GalleryUploader } from "@/components/admin/gallery-uploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAdminCollection, getAllCategoriesAdmin } from "@/lib/queries";

export async function generateMetadata({
  params,
}: PageProps<"/admin/collections/[id]">) {
  const { id } = await params;
  const collection = await getAdminCollection(id);
  return { title: collection ? `ویرایش ${collection.titleFa}` : "ویرایش مجموعه" };
}

export default async function EditCollectionPage({
  params,
}: PageProps<"/admin/collections/[id]">) {
  const { id } = await params;
  const [collection, categories] = await Promise.all([
    getAdminCollection(id),
    getAllCategoriesAdmin(),
  ]);

  if (!collection) notFound();

  return (
    <div className="max-w-5xl space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-semibold">ویرایش مجموعه</h1>
        <p className="mt-2 text-sm text-muted-foreground">{collection.titleFa}</p>
      </div>

      <CollectionForm
        categories={categories}
        initial={{
          id: collection.id,
          titleFa: collection.titleFa,
          slug: collection.slug,
          descriptionFa: collection.descriptionFa,
          excerptFa: collection.excerptFa,
          featured: collection.featured,
          published: collection.published,
          categoryId: collection.categoryId,
        }}
      />

      <Separator />

      <Card className="border-white/10 bg-white/[0.03] ring-amber-400/10">
        <CardHeader>
          <CardTitle>گالری تصاویر</CardTitle>
          <CardDescription>
            چند تصویر را هم‌زمان آپلود کنید، متن جایگزین را ذخیره کنید و با کشیدن یا دکمه‌ها ترتیب را عوض کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GalleryUploader collectionId={collection.id} images={collection.images} />
        </CardContent>
      </Card>
    </div>
  );
}
