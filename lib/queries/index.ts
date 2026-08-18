import { cache } from "react";
import { asDbError, db } from "@/lib/db";

/** Scalar columns that exist on Neon `Collection` — never select dropped fields like modelGlbUrl. */
const collectionColumns = {
  id: true,
  titleFa: true,
  slug: true,
  descriptionFa: true,
  excerptFa: true,
  featured: true,
  published: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
} as const;

const categoryColumns = {
  id: true,
  nameFa: true,
  slug: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} as const;

const galleryImageColumns = {
  id: true,
  collectionId: true,
  url: true,
  blobPath: true,
  altFa: true,
  order: true,
  createdAt: true,
} as const;

async function safeQuery<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[db:${label}]`, asDbError(error));
    return fallback;
  }
}

export const getSiteSettings = cache(async () => {
  return safeQuery("getSiteSettings", () => db.siteSettings.findUnique({ where: { id: "singleton" } }), null);
});

export const getCategories = cache(async () => {
  return safeQuery(
    "getCategories",
    () =>
      db.category.findMany({
        orderBy: [{ order: "asc" }, { nameFa: "asc" }],
        include: {
          _count: {
            select: {
              collections: {
                where: { published: true },
              },
            },
          },
        },
      }),
    [],
  );
});

export const getPublishedCollections = cache(async (categorySlug?: string) => {
  return safeQuery(
    "getPublishedCollections",
    () =>
      db.collection.findMany({
        where: {
          published: true,
          ...(categorySlug
            ? {
                category: {
                  slug: categorySlug,
                },
              }
            : {}),
        },
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
        select: {
          ...collectionColumns,
          category: { select: categoryColumns },
          images: {
            orderBy: { order: "asc" },
            take: 1,
            select: galleryImageColumns,
          },
        },
      }),
    [],
  );
});

export const getFeaturedCollections = cache(async () => {
  return safeQuery(
    "getFeaturedCollections",
    () =>
      db.collection.findMany({
        where: { published: true, featured: true },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: {
          ...collectionColumns,
          category: { select: categoryColumns },
          images: {
            orderBy: { order: "asc" },
            take: 1,
            select: galleryImageColumns,
          },
        },
      }),
    [],
  );
});

export const getCollectionBySlug = cache(async (slug: string) => {
  return safeQuery(
    "getCollectionBySlug",
    () =>
      db.collection.findFirst({
        where: { slug, published: true },
        select: {
          ...collectionColumns,
          category: { select: categoryColumns },
          images: {
            orderBy: { order: "asc" },
            select: galleryImageColumns,
          },
        },
      }),
    null,
  );
});

export async function getAdminStats() {
  try {
    const [published, drafts, images, categories] = await Promise.all([
      db.collection.count({ where: { published: true } }),
      db.collection.count({ where: { published: false } }),
      db.galleryImage.count(),
      db.category.count(),
    ]);

    return { published, drafts, images, categories };
  } catch (error) {
    throw asDbError(error);
  }
}

export async function getAdminCollections(search?: string) {
  try {
    return await db.collection.findMany({
      where: search
        ? {
            OR: [
              { titleFa: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
      select: {
        ...collectionColumns,
        category: { select: { id: true, nameFa: true, slug: true } },
        _count: { select: { images: true } },
      },
    });
  } catch (error) {
    throw asDbError(error);
  }
}

export async function getAdminCollection(id: string) {
  try {
    return await db.collection.findUnique({
      where: { id },
      select: {
        ...collectionColumns,
        category: { select: categoryColumns },
        images: {
          orderBy: { order: "asc" },
          select: galleryImageColumns,
        },
      },
    });
  } catch (error) {
    throw asDbError(error);
  }
}

export async function getAllCategoriesAdmin() {
  try {
    return await db.category.findMany({
      orderBy: [{ order: "asc" }, { nameFa: "asc" }],
      include: {
        _count: { select: { collections: true } },
      },
    });
  } catch (error) {
    throw asDbError(error);
  }
}
