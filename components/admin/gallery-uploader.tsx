"use client";

import { useGSAP } from "@gsap/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  GripVerticalIcon,
  ImagePlusIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  deleteGalleryImageAction,
  reorderGalleryImagesAction,
  saveGalleryImagesAction,
  updateGalleryImageAction,
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
import { Progress } from "@/components/ui/progress";
import { SafeImage } from "@/components/ui/safe-image";
import { Skeleton } from "@/components/ui/skeleton";
import { postAdminUpload } from "@/lib/admin-upload-client";
import { adminKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type GalleryImage = {
  id: string;
  url: string;
  blobPath: string;
  altFa?: string | null;
  order: number;
  status?: "ready" | "uploading";
  progress?: number;
  previewUrl?: string;
};

function isOptimistic(id: string) {
  return id.startsWith("optimistic-");
}

export function GalleryUploader({
  collectionId,
  images: initialImages,
}: {
  collectionId: string;
  images: GalleryImage[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const gridRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const uploading = images.some((image) => image.status === "uploading");
  const persistedIds = useMemo(
    () => images.filter((image) => !isOptimistic(image.id)).map((image) => image.id),
    [images],
  );

  useEffect(() => {
    setImages((current) => {
      const inFlight = current.filter((image) => image.status === "uploading");
      return [...initialImages.map((image) => ({ ...image, status: "ready" as const })), ...inFlight];
    });
  }, [initialImages]);

  useGSAP(
    () => {
      gsap.from(".gallery-card", {
        opacity: 0,
        y: 16,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      });
    },
    { scope: gridRef, dependencies: [images.length] },
  );

  const persistOrder = async (next: GalleryImage[]) => {
    const orderedIds = next.filter((image) => !isOptimistic(image.id)).map((image) => image.id);
    if (!orderedIds.length) return;
    const result = await reorderGalleryImagesAction(collectionId, orderedIds);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: adminKeys.gallery(collectionId) });
    router.refresh();
  };

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => files,
    onMutate: async (files) => {
      const optimistic = files.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);
        return {
          id: `optimistic-${crypto.randomUUID()}`,
          url: previewUrl,
          blobPath: "",
          altFa: "",
          order: images.length + index,
          status: "uploading" as const,
          progress: 6,
          previewUrl,
        };
      });
      setImages((current) => [...current, ...optimistic]);
      return {
        optimisticIds: optimistic.map((item) => item.id),
        previewUrls: optimistic.map((item) => item.previewUrl),
      };
    },
    onSuccess: async (files, _vars, context) => {
      try {
        const uploaded = await postAdminUpload({
          files,
          collectionId,
          onProgress: (percent) => {
            setImages((current) =>
              current.map((image) =>
                context?.optimisticIds.includes(image.id)
                  ? { ...image, progress: percent }
                  : image,
              ),
            );
          },
        });

        const saved = await saveGalleryImagesAction(
          collectionId,
          uploaded.map((file, index) => ({
            url: file.url,
            blobPath: file.blobPath,
            order: index,
          })),
        );
        if (!saved.ok) {
          throw new Error(saved.error);
        }

        setImages((current) => {
          const withoutOptimistic = current.filter(
            (image) => !context?.optimisticIds.includes(image.id),
          );
          const persisted = withoutOptimistic.filter((image) => !isOptimistic(image.id));
          const stillUploading = withoutOptimistic.filter((image) => isOptimistic(image.id));
          return [
            ...persisted,
            ...saved.images.map((image) => ({ ...image, status: "ready" as const })),
            ...stillUploading,
          ];
        });

        await queryClient.invalidateQueries({ queryKey: adminKeys.gallery(collectionId) });
        await queryClient.invalidateQueries({ queryKey: adminKeys.collections() });
        toast.success(`${saved.images.length} تصویر به گالری اضافه شد`);
        router.refresh();
      } catch (error) {
        setImages((current) =>
          current.filter((image) => !context?.optimisticIds.includes(image.id)),
        );
        toast.error(error instanceof Error ? error.message : "خطا در آپلود");
      }
    },
    onSettled: (_data, _error, _vars, context) => {
      context?.previewUrls.forEach((url) => URL.revokeObjectURL(url));
    },
  });

  const busy = uploading || uploadMutation.isPending;

  const uploadFiles = (list: FileList | File[]) => {
    if (busy) return;
    const files = Array.from(list).filter((file) => file.type.startsWith("image/"));
    if (!files.length) {
      toast.error("فقط فایل تصویری قابل آپلود است");
      return;
    }
    uploadMutation.mutate(files);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    if (busy) return;
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const current = next[index];
    const other = next[target];
    if (!current || !other) return;
    next[index] = other;
    next[target] = current;
    setImages(next);
    void persistOrder(next);
  };

  const overallProgress = Math.round(
    images
      .filter((image) => image.status === "uploading")
      .reduce((sum, image) => sum + (image.progress ?? 0), 0) /
      Math.max(1, images.filter((image) => image.status === "uploading").length),
  );

  return (
    <div className="space-y-6">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files?.length) uploadFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-44 flex-col items-center justify-center rounded-3xl border border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-amber-300 bg-amber-400/15"
            : "border-amber-400/30 bg-amber-400/5",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <ImagePlusIcon className="mb-3 size-8 text-amber-300" />
        <p className="text-sm text-muted-foreground">
          تصاویر را بکشید و رها کنید یا از دکمه زیر انتخاب کنید
        </p>
        <p className="mt-1 text-xs text-muted-foreground">jpg، png، webp، gif یا avif — حداکثر ۱۲ مگابایت</p>
        <label htmlFor="gallery-files" className="mt-4 cursor-pointer">
          <input
            id="gallery-files"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              if (event.target.files) uploadFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <span className="inline-flex h-9 items-center justify-center rounded-lg bg-amber-400 px-4 text-sm font-medium text-black hover:bg-amber-300">
            {busy ? "در حال آپلود..." : "انتخاب تصاویر"}
          </span>
        </label>
        {busy ? (
          <div className="mt-5 w-full max-w-sm">
            <Progress value={overallProgress} className="w-full">
              <span className="text-xs text-muted-foreground">آپلود {overallProgress}٪</span>
            </Progress>
          </div>
        ) : null}
      </div>

      {busy && !images.some((image) => image.status === "uploading") ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : null}

      <div ref={gridRef} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {images.map((image, index) => {
          const src = image.previewUrl ?? image.url;
          const localPreview = src.startsWith("blob:") || src.startsWith("data:");
          return (
            <div
              key={image.id}
              draggable={!busy && !isOptimistic(image.id)}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex == null || dragIndex === index) return;
                const next = [...images];
                const [moved] = next.splice(dragIndex, 1);
                if (!moved) return;
                next.splice(index, 0, moved);
                setDragIndex(null);
                setImages(next);
                void persistOrder(next);
              }}
              className="gallery-card overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div className="relative aspect-square">
                {localPreview ? (
                  // Object URLs cannot go through next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={image.altFa ?? "تصویر"} className="size-full object-cover" />
                ) : (
                  <SafeImage src={src} alt={image.altFa ?? "تصویر"} fill className="object-cover" />
                )}
                {image.status === "uploading" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 p-6">
                    <Loader2Icon className="size-6 animate-spin text-amber-300" />
                    <Progress value={image.progress ?? 10} className="w-full" />
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 rounded-md bg-black/50 p-1 text-white/80">
                    <GripVerticalIcon className="size-4" />
                  </div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <Input
                  defaultValue={image.altFa ?? ""}
                  placeholder="متن جایگزین"
                  disabled={busy || isOptimistic(image.id)}
                  onBlur={(event) => {
                    if (isOptimistic(image.id)) return;
                    const nextAlt = event.target.value.trim();
                    if (nextAlt === (image.altFa ?? "").trim()) return;
                    void (async () => {
                      const result = await updateGalleryImageAction(image.id, { altFa: nextAlt });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      setImages((current) =>
                        current.map((item) =>
                          item.id === image.id ? { ...item, altFa: nextAlt } : item,
                        ),
                      );
                      await queryClient.invalidateQueries({
                        queryKey: adminKeys.gallery(collectionId),
                      });
                      toast.success("متن جایگزین ذخیره شد");
                    })();
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || index === 0}
                    onClick={() => moveImage(index, -1)}
                  >
                    <ArrowUpIcon />
                    بالا
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || index === images.length - 1}
                    onClick={() => moveImage(index, 1)}
                  >
                    <ArrowDownIcon />
                    پایین
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={busy || isOptimistic(image.id)}
                    onClick={() => setDeleteTarget(image)}
                  >
                    <Trash2Icon />
                    حذف
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف تصویر</DialogTitle>
            <DialogDescription>
              این تصویر از گالری و فضای ذخیره‌سازی حذف می‌شود. این کار قابل بازگشت نیست.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              انصراف
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!deleteTarget || busy}
              onClick={() => {
                if (!deleteTarget) return;
                const id = deleteTarget.id;
                void (async () => {
                  const result = await deleteGalleryImageAction(id);
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success("تصویر حذف شد");
                  setImages((current) => current.filter((item) => item.id !== id));
                  setDeleteTarget(null);
                  await queryClient.invalidateQueries({ queryKey: adminKeys.gallery(collectionId) });
                  router.refresh();
                })();
              }}
            >
              حذف قطعی
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="sr-only">{persistedIds.length} تصویر ذخیره‌شده</p>
    </div>
  );
}
