"use client";

import { useGSAP } from "@gsap/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { upsertCollectionAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminKeys } from "@/lib/query-keys";
import { slugifyFa } from "@/lib/slug";
import { collectionFormSchema } from "@/lib/validations";
import type { z } from "zod";

gsap.registerPlugin(useGSAP);

type CategoryOption = {
  id: string;
  nameFa: string;
};

type CollectionFormValues = z.infer<typeof collectionFormSchema>;

type CollectionFormProps = {
  categories: CategoryOption[];
  initial?: {
    id: string;
    titleFa: string;
    slug: string;
    descriptionFa: string;
    excerptFa?: string | null;
    featured: boolean;
    published: boolean;
    categoryId?: string | null;
  };
};

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs text-destructive"
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export function CollectionForm({ categories, initial }: CollectionFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const slugLocked = useRef(Boolean(initial?.slug));

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      titleFa: initial?.titleFa ?? "",
      slug: initial?.slug ?? "",
      descriptionFa: initial?.descriptionFa ?? "",
      excerptFa: initial?.excerptFa ?? "",
      featured: initial?.featured ?? false,
      published: initial?.published ?? false,
      categoryId: initial?.categoryId ?? "",
    },
  });

  useGSAP(
    () => {
      gsap.from(".form-block", {
        opacity: 0,
        y: 14,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
      });
    },
    { scope: formRef },
  );

  const saveMutation = useMutation({
    mutationFn: async (values: CollectionFormValues) => {
      const formData = new FormData();
      if (initial?.id) formData.append("id", initial.id);
      formData.append("titleFa", values.titleFa);
      formData.append("slug", values.slug || slugifyFa(values.titleFa));
      formData.append("descriptionFa", values.descriptionFa);
      formData.append("excerptFa", values.excerptFa ?? "");
      formData.append("featured", values.featured ? "true" : "false");
      formData.append("published", values.published ? "true" : "false");
      formData.append("categoryId", values.categoryId ?? "");
      return upsertCollectionAction(formData);
    },
    onSuccess: async (result) => {
      if (!result.ok) {
        toast.error(result.error);
        if (result.fieldErrors) {
          for (const [key, message] of Object.entries(result.fieldErrors)) {
            form.setError(key as keyof CollectionFormValues, { message });
          }
        }
        return;
      }
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success(initial ? "مجموعه با موفقیت به‌روزرسانی شد" : "مجموعه ایجاد شد");
      router.push(`/admin/collections/${result.id}`);
      router.refresh();
    },
    onError: () => {
      toast.error("ذخیره مجموعه ناموفق بود");
    },
  });

  const pending = saveMutation.isPending;

  return (
    <Card className="border-white/10 bg-white/[0.03] ring-1 ring-amber-400/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-amber-300" />
          جزئیات مجموعه
        </CardTitle>
        <CardDescription>
          عنوان، اسلاگ و توضیحات را کامل کنید. اسلاگ از عنوان فارسی ساخته می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pending ? (
          <div className="mb-6">
            <Skeleton className="h-2 w-full rounded-full bg-amber-400/20" />
          </div>
        ) : null}
        <form
          ref={formRef}
          className="space-y-6"
          onSubmit={form.handleSubmit((values: CollectionFormValues) => {
            if (pending) return;
            saveMutation.mutate(values);
          })}
        >
          <div className="form-block grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="titleFa">عنوان</Label>
              <Input
                id="titleFa"
                aria-invalid={Boolean(form.formState.errors.titleFa)}
                disabled={pending}
                {...form.register("titleFa", {
                  onChange: (event) => {
                    if (initial || slugLocked.current) return;
                    form.setValue("slug", slugifyFa(event.target.value), { shouldValidate: true });
                  },
                })}
              />
              <FieldError message={form.formState.errors.titleFa?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">اسلاگ</Label>
              <Input
                id="slug"
                dir="ltr"
                aria-invalid={Boolean(form.formState.errors.slug)}
                disabled={pending}
                {...form.register("slug", {
                  onChange: () => {
                    slugLocked.current = true;
                  },
                })}
              />
              <FieldError message={form.formState.errors.slug?.message} />
            </div>
          </div>

          <div className="form-block space-y-2">
            <Label htmlFor="excerptFa">خلاصه</Label>
            <Input id="excerptFa" disabled={pending} {...form.register("excerptFa")} />
            <FieldError message={form.formState.errors.excerptFa?.message} />
          </div>

          <div className="form-block space-y-2">
            <Label htmlFor="descriptionFa">توضیحات</Label>
            <Textarea
              id="descriptionFa"
              rows={8}
              disabled={pending}
              aria-invalid={Boolean(form.formState.errors.descriptionFa)}
              {...form.register("descriptionFa")}
            />
            <FieldError message={form.formState.errors.descriptionFa?.message} />
          </div>

          <div className="form-block space-y-2">
            <Label htmlFor="categoryId">دسته‌بندی</Label>
            <select
              id="categoryId"
              disabled={pending}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
              {...form.register("categoryId")}
            >
              <option value="">بدون دسته</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nameFa}
                </option>
              ))}
            </select>
          </div>

          <div className="form-block flex flex-wrap gap-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <Controller
              control={form.control}
              name="featured"
              render={({ field }) => (
                <label className="flex items-center gap-3 text-sm">
                  <Switch
                    checked={field.value}
                    disabled={pending}
                    onCheckedChange={field.onChange}
                  />
                  مجموعه ویژه
                </label>
              )}
            />
            <Controller
              control={form.control}
              name="published"
              render={({ field }) => (
                <label className="flex items-center gap-3 text-sm">
                  <Switch
                    checked={field.value}
                    disabled={pending}
                    onCheckedChange={field.onChange}
                  />
                  منتشر شده
                </label>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="bg-amber-400 text-black hover:bg-amber-300"
          >
            {pending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                در حال ذخیره...
              </>
            ) : initial ? (
              "ذخیره تغییرات"
            ) : (
              "ایجاد مجموعه"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
