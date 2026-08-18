export const adminKeys = {
  all: ["admin"] as const,
  collections: () => [...adminKeys.all, "collections"] as const,
  collection: (id: string) => [...adminKeys.collections(), id] as const,
  gallery: (id: string) => [...adminKeys.collection(id), "gallery"] as const,
  categories: () => [...adminKeys.all, "categories"] as const,
  settings: () => [...adminKeys.all, "settings"] as const,
};
