"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteCollectionAction,
  toggleCollectionFeaturedAction,
  toggleCollectionPublishedAction,
} from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminKeys } from "@/lib/query-keys";

type AdminCollection = {
  id: string;
  titleFa: string;
  slug: string;
  featured: boolean;
  published: boolean;
  category?: { nameFa: string } | null;
  _count: { images: number };
};

export function CollectionsTable({ collections }: { collections: AdminCollection[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<AdminCollection | null>(null);

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      toggleCollectionPublishedAction(id, published),
    onSuccess: async (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: adminKeys.collections() });
      toast.success("وضعیت انتشار تغییر کرد");
      router.refresh();
    },
  });

  const featuredMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      toggleCollectionFeaturedAction(id, featured),
    onSuccess: async (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: adminKeys.collections() });
      toast.success("وضعیت ویژه تغییر کرد");
      router.refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCollectionAction(id),
    onSuccess: async (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: adminKeys.collections() });
      toast.success("مجموعه حذف شد");
      setDeleteTarget(null);
      router.refresh();
    },
  });

  const pending =
    publishMutation.isPending || featuredMutation.isPending || deleteMutation.isPending;

  return (
    <>
    <div className="grid gap-4">
      {collections.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-muted-foreground">
          هنوز مجموعه‌ای ثبت نشده است.
        </div>
      ) : null}
      {collections.map((collection) => (
        <Card key={collection.id} className="border-white/10 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>{collection.titleFa}</CardTitle>
              <CardDescription dir="ltr">{collection.slug}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {collection.published ? (
                <Badge className="bg-emerald-400/15 text-emerald-200">منتشر شده</Badge>
              ) : (
                <Badge variant="secondary">پیش‌نویس</Badge>
              )}
              {collection.featured ? <Badge className="bg-amber-400/15 text-amber-100">ویژه</Badge> : null}
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {collection.category?.nameFa ?? "بدون دسته"} • {collection._count.images} تصویر
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                nativeButton={false}
                variant="outline"
                size="sm"
                render={<Link href={`/admin/collections/${collection.id}`} />}
              >
                ویرایش
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  publishMutation.mutate({
                    id: collection.id,
                    published: !collection.published,
                  });
                }}
              >
                {collection.published ? "عدم انتشار" : "انتشار"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  featuredMutation.mutate({
                    id: collection.id,
                    featured: !collection.featured,
                  });
                }}
              >
                {collection.featured ? "حذف ویژه" : "ویژه کردن"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={pending}
                onClick={() => setDeleteTarget(collection)}
              >
                حذف
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حذف مجموعه</DialogTitle>
          <DialogDescription>
            {deleteTarget
              ? `مجموعه «${deleteTarget.titleFa}» و تصاویر آن برای همیشه حذف می‌شود.`
              : "این مجموعه حذف می‌شود."}
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
              deleteMutation.mutate(id);
            }}
          >
            حذف قطعی
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
