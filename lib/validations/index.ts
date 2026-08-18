import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("ایمیل نامعتبر است"),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
});

export const categorySchema = z.object({
  nameFa: z.string().min(2, "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد"),
  slug: z
    .string()
    .min(2, "اسلاگ باید حداقل ۲ کاراکتر باشد")
    .regex(/^[a-z0-9-]+$/, "اسلاگ فقط می‌تواند شامل حروف انگلیسی، عدد و خط تیره باشد"),
  order: z.coerce.number().int().min(0).default(0),
});

const booleanFromForm = z
  .union([z.boolean(), z.enum(["true", "false", "on", "1", "0"])])
  .transform((value) => value === true || value === "true" || value === "on" || value === "1");

export const collectionSchema = z.object({
  titleFa: z.string().trim().min(2, "عنوان باید حداقل ۲ کاراکتر باشد"),
  slug: z
    .string()
    .trim()
    .min(2, "اسلاگ باید حداقل ۲ کاراکتر باشد")
    .regex(/^[a-z0-9-]+$/, "اسلاگ فقط می‌تواند شامل حروف انگلیسی، عدد و خط تیره باشد"),
  descriptionFa: z.string().trim().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
  excerptFa: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  featured: booleanFromForm,
  published: booleanFromForm,
  categoryId: z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => (value === "" || value === "none" || value == null ? null : value)),
});

export const siteSettingsSchema = z.object({
  heroTitleFa: z.string().min(2, "عنوان قهرمان الزامی است"),
  heroSubtitleFa: z.string().optional(),
  aboutFa: z.string().min(20, "متن درباره ما باید حداقل ۲۰ کاراکتر باشد"),
  addressFa: z.string().optional(),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
});

export const collectionFormSchema = z.object({
  titleFa: z.string().trim().min(2, "عنوان باید حداقل ۲ کاراکتر باشد"),
  slug: z
    .string()
    .trim()
    .min(2, "اسلاگ باید حداقل ۲ کاراکتر باشد")
    .regex(/^[a-z0-9-]+$/, "اسلاگ فقط می‌تواند شامل حروف انگلیسی، عدد و خط تیره باشد"),
  descriptionFa: z.string().trim().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
  excerptFa: z.string().optional(),
  featured: z.boolean(),
  published: z.boolean(),
  categoryId: z.string().optional().nullable(),
});

export const galleryImageSchema = z.object({
  collectionId: z.string().min(1, "شناسه مجموعه الزامی است"),
  altFa: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
});

export const galleryImageCreateItemSchema = z.object({
  url: z
    .string()
    .min(1, "آدرس تصویر الزامی است")
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
      "آدرس تصویر نامعتبر است",
    ),
  blobPath: z.string().min(1, "مسیر فایل الزامی است"),
  altFa: z.string().trim().optional(),
  order: z.number().int().min(0),
});

export const galleryImagesCreateSchema = z.object({
  collectionId: z.string().min(1, "شناسه مجموعه الزامی است"),
  images: z.array(galleryImageCreateItemSchema).min(1, "حداقل یک تصویر لازم است"),
});

export const galleryImageUpdateSchema = z.object({
  id: z.string().min(1, "شناسه تصویر الزامی است"),
  altFa: z.string().trim().max(180, "متن جایگزین خیلی طولانی است").optional(),
  order: z.number().int().min(0).optional(),
});

export const galleryReorderSchema = z.object({
  collectionId: z.string().min(1, "شناسه مجموعه الزامی است"),
  orderedIds: z.array(z.string().min(1)).min(1, "لیست ترتیب خالی است"),
});

export const uploadRequestSchema = z.object({
  collectionId: z.string().min(1).optional(),
  kind: z.enum(["image"]).default("image"),
});

export function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const { fieldErrors } = error.flatten();
  const result: Record<string, string> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const message = Array.isArray(messages) ? messages[0] : messages;
    if (typeof message === "string" && message) {
      result[key] = message;
    }
  }
  return result;
}

export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type ActionOk<T extends object = object> = { ok: true } & T;
export type ActionFail = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
};
export type ActionResult<T extends object = object> = ActionOk<T> | ActionFail;
