import Link from "next/link";
import { CollectionsTable } from "@/components/admin/collections-table";
import { Button } from "@/components/ui/button";
import { getAdminCollections } from "@/lib/queries";

export const metadata = {
  title: "مدیریت مجموعه‌ها",
};

export default async function AdminCollectionsPage() {
  const collections = await getAdminCollections();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">مجموعه‌ها</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            مدیریت گالری، توضیحات و وضعیت انتشار
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/collections/new" />}
          className="bg-amber-400 text-black hover:bg-amber-300"
        >
          مجموعه جدید
        </Button>
      </div>
      <CollectionsTable collections={collections} />
    </div>
  );
}
