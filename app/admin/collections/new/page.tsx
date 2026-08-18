import { CollectionForm } from "@/components/admin/collection-form";
import { getAllCategoriesAdmin } from "@/lib/queries";

export const metadata = {
  title: "مجموعه جدید",
};

export default async function NewCollectionPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">ایجاد مجموعه جدید</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          عنوان، توضیحات و دسته‌بندی را ثبت کنید؛ سپس تصاویر را آپلود کنید.
        </p>
      </div>
      <CollectionForm categories={categories} />
    </div>
  );
}
