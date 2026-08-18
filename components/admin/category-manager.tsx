"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteCategoryAction,
  upsertCategoryAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminKeys } from "@/lib/query-keys";
import { slugifyFa } from "@/lib/slug";

type Category = {
  id: string;
  nameFa: string;
  slug: string;
  order: number;
  _count?: { collections: number };
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const slugLocked = useRef(false);

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <form
        className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
        action={(formData) => {
          startTransition(async () => {
            const result = await upsertCategoryAction(formData);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            await queryClient.invalidateQueries({ queryKey: adminKeys.categories() });
            toast.success("دسته‌بندی ذخیره شد");
            slugLocked.current = false;
            router.refresh();
          });
        }}
      >
        <div>
          <p className="font-medium">دسته‌بندی جدید</p>
          <p className="text-sm text-muted-foreground">لوستر، لامپ، آباژور و ...</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameFa">نام فارسی</Label>
          <Input
            id="nameFa"
            name="nameFa"
            required
            disabled={pending}
            onChange={(event) => {
              if (slugLocked.current || !slugRef.current) return;
              slugRef.current.value = slugifyFa(event.target.value);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">اسلاگ</Label>
          <Input
            id="slug"
            name="slug"
            ref={slugRef}
            placeholder="chandelier"
            dir="ltr"
            disabled={pending}
            onChange={() => {
              slugLocked.current = true;
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">ترتیب</Label>
          <Input id="order" name="order" type="number" defaultValue={0} disabled={pending} />
        </div>
        <Button type="submit" disabled={pending} className="w-full bg-amber-400 text-black">
          {pending ? "در حال ذخیره..." : "افزودن دسته"}
        </Button>
      </form>

      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div>
              <p className="font-medium">{category.nameFa}</p>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {category.slug} • {category._count?.collections ?? 0} مجموعه
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={() => setDeleteTarget(category)}
            >
              حذف
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف دسته‌بندی</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `دسته‌بندی «${deleteTarget.nameFa}» حذف می‌شود. مجموعه‌های مرتبط بدون دسته می‌مانند.`
                : "این دسته‌بندی حذف می‌شود."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              انصراف
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending || !deleteTarget}
              onClick={() => {
                if (!deleteTarget) return;
                const id = deleteTarget.id;
                startTransition(async () => {
                  const result = await deleteCategoryAction(id);
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  await queryClient.invalidateQueries({ queryKey: adminKeys.categories() });
                  toast.success("دسته حذف شد");
                  setDeleteTarget(null);
                  router.refresh();
                });
              }}
            >
              حذف قطعی
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
