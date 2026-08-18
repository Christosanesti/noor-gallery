"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { slugifyFa } from "@/lib/slug";
import { deleteGalleryAsset } from "@/lib/upload";
import {
  type ActionFail,
  type ActionResult,
  categorySchema,
  collectionSchema,
  fieldErrorsFromZod,
  galleryImageUpdateSchema,
  galleryImagesCreateSchema,
  galleryReorderSchema,
  siteSettingsSchema,
} from "@/lib/validations";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin");
}

function fail(error: unknown, fallback = "خطای غیرمنتظره رخ داد"): ActionFail {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return { ok: false, error: "این اسلاگ قبلاً استفاده شده است" };
  }
  console.error(error);
  return { ok: false, error: fallback };
}

export async function upsertCategoryAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    nameFa: formData.get("nameFa"),
    slug: formData.get("slug") || slugifyFa(String(formData.get("nameFa") ?? "")),
    order: formData.get("order") ?? 0,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "خطای اعتبارسنجی",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const id = String(formData.get("id") ?? "");

  try {
    if (id) {
      await db.category.update({ where: { id }, data: parsed.data });
    } else {
      await db.category.create({ data: parsed.data });
    }
  } catch (error) {
    return fail(error, "ذخیره دسته‌بندی ناموفق بود");
  }

  revalidateAll();
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.category.delete({ where: { id } });
  } catch (error) {
    return fail(error, "حذف دسته‌بندی ناموفق بود");
  }
  revalidateAll();
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function upsertCollectionAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = collectionSchema.safeParse({
    titleFa: String(formData.get("titleFa") ?? ""),
    slug: String(formData.get("slug") ?? "") || slugifyFa(String(formData.get("titleFa") ?? "")),
    descriptionFa: String(formData.get("descriptionFa") ?? ""),
    excerptFa: String(formData.get("excerptFa") ?? "") || undefined,
    featured: String(formData.get("featured") ?? "false"),
    published: String(formData.get("published") ?? "false"),
    categoryId: String(formData.get("categoryId") ?? "") || null,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "خطای اعتبارسنجی",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const id = String(formData.get("id") ?? "");
  const data = {
    ...parsed.data,
    categoryId: parsed.data.categoryId || null,
  };

  try {
    const collection = id
      ? await db.collection.update({ where: { id }, data, select: { id: true } })
      : await db.collection.create({ data, select: { id: true } });

    revalidateAll();
    revalidatePath("/admin/collections");
    revalidatePath(`/admin/collections/${collection.id}`);
    return { ok: true, id: collection.id };
  } catch (error) {
    return fail(error, "ذخیره مجموعه ناموفق بود");
  }
}

export async function deleteCollectionAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const images = await db.galleryImage.findMany({ where: { collectionId: id } });
    for (const image of images) {
      await deleteGalleryAsset(image.url, image.blobPath);
    }
    await db.collection.delete({ where: { id } });
  } catch (error) {
    return fail(error, "حذف مجموعه ناموفق بود");
  }

  revalidateAll();
  revalidatePath("/admin/collections");
  return { ok: true };
}

export async function toggleCollectionPublishedAction(
  id: string,
  published: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.collection.update({ where: { id }, data: { published } });
  } catch (error) {
    return fail(error, "تغییر وضعیت انتشار ناموفق بود");
  }
  revalidateAll();
  revalidatePath("/admin/collections");
  return { ok: true };
}

export async function toggleCollectionFeaturedAction(
  id: string,
  featured: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.collection.update({ where: { id }, data: { featured } });
  } catch (error) {
    return fail(error, "تغییر وضعیت ویژه ناموفق بود");
  }
  revalidateAll();
  revalidatePath("/admin/collections");
  return { ok: true };
}

export async function saveGalleryImagesAction(
  collectionId: string,
  images: Array<{ url: string; blobPath: string; altFa?: string; order: number }>,
): Promise<ActionResult<{ images: Array<{ id: string; url: string; blobPath: string; altFa: string | null; order: number }> }>> {
  await requireAdmin();

  const parsed = galleryImagesCreateSchema.safeParse({ collectionId, images });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "خطای اعتبارسنجی",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const maxOrder = await db.galleryImage.aggregate({
      where: { collectionId: parsed.data.collectionId },
      _max: { order: true },
    });
    const start = (maxOrder._max.order ?? -1) + 1;

    const created = await db.galleryImage.createManyAndReturn({
      data: parsed.data.images.map((image, index) => ({
        collectionId: parsed.data.collectionId,
        url: image.url,
        blobPath: image.blobPath,
        altFa: image.altFa,
        order: start + index,
      })),
    });

    revalidateAll();
    revalidatePath(`/admin/collections/${collectionId}`);
    return {
      ok: true,
      images: created.map((image) => ({
        id: image.id,
        url: image.url,
        blobPath: image.blobPath,
        altFa: image.altFa,
        order: image.order,
      })),
    };
  } catch (error) {
    return fail(error, "ثبت تصاویر گالری ناموفق بود");
  }
}

export async function updateGalleryImageAction(
  id: string,
  data: { altFa?: string; order?: number },
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = galleryImageUpdateSchema.safeParse({ id, ...data });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "خطای اعتبارسنجی",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const image = await db.galleryImage.update({
      where: { id: parsed.data.id },
      data: {
        altFa: parsed.data.altFa,
        order: parsed.data.order,
      },
    });
    revalidateAll();
    revalidatePath(`/admin/collections/${image.collectionId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "به‌روزرسانی تصویر ناموفق بود");
  }
}

export async function deleteGalleryImageAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const image = await db.galleryImage.findUnique({ where: { id } });
    if (!image) return { ok: false, error: "تصویر یافت نشد" };

    await deleteGalleryAsset(image.url, image.blobPath);
    await db.galleryImage.delete({ where: { id } });
    revalidateAll();
    revalidatePath(`/admin/collections/${image.collectionId}`);
    return { ok: true };
  } catch (error) {
    return fail(error, "حذف تصویر ناموفق بود");
  }
}

export async function reorderGalleryImagesAction(
  collectionId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = galleryReorderSchema.safeParse({ collectionId, orderedIds });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "خطای اعتبارسنجی",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const existing = await db.galleryImage.findMany({
      where: { collectionId: parsed.data.collectionId, id: { in: parsed.data.orderedIds } },
      select: { id: true },
    });

    if (existing.length !== parsed.data.orderedIds.length) {
      return { ok: false, error: "ترتیب تصاویر نامعتبر است" };
    }

    await db.$transaction(
      parsed.data.orderedIds.map((imageId, index) =>
        db.galleryImage.update({
          where: { id: imageId },
          data: { order: index },
        }),
      ),
    );
  } catch (error) {
    return fail(error, "ذخیره ترتیب تصاویر ناموفق بود");
  }

  revalidateAll();
  revalidatePath(`/admin/collections/${collectionId}`);
  return { ok: true };
}

export async function upsertSiteSettingsAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = siteSettingsSchema.safeParse({
    heroTitleFa: formData.get("heroTitleFa"),
    heroSubtitleFa: formData.get("heroSubtitleFa") || undefined,
    aboutFa: formData.get("aboutFa"),
    addressFa: formData.get("addressFa") || undefined,
    phone: formData.get("phone") || undefined,
    instagram: formData.get("instagram") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "خطای اعتبارسنجی",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await db.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...parsed.data },
      update: parsed.data,
    });
  } catch (error) {
    return fail(error, "ذخیره تنظیمات ناموفق بود");
  }

  revalidateAll();
  revalidatePath("/admin/settings");
  return { ok: true };
}
