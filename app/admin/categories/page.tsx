import { CategoryManager } from "@/components/admin/category-manager";
import { getAllCategoriesAdmin } from "@/lib/queries";

export const metadata = {
  title: "دسته‌بندی‌ها",
};

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">دسته‌بندی‌ها</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          دسته‌بندی مجموعه‌های لوستر، لامپ و روشنایی
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
