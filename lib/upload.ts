import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

export type UploadKind = "image";

export type UploadResult = {
  url: string;
  blobPath: string;
  kind: UploadKind;
  filename: string;
  size: number;
};

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

function extensionOf(filename: string) {
  return filename.split(".").pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, "") ?? "";
}

function sniffImageMime(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (buffer.length >= 6 && buffer.subarray(0, 6).toString("ascii") === "GIF87a") {
    return "image/gif";
  }
  if (buffer.length >= 6 && buffer.subarray(0, 6).toString("ascii") === "GIF89a") {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    return "image/avif";
  }
  return null;
}

export function detectUploadKind(file: File): UploadKind | null {
  const ext = extensionOf(file.name);
  const mime = file.type.toLowerCase();

  if (IMAGE_MIME_TYPES.includes(mime as (typeof IMAGE_MIME_TYPES)[number]) || IMAGE_EXTENSIONS.has(ext)) {
    return "image";
  }
  return null;
}

export async function validateUploadFile(
  file: File,
): Promise<{ buffer: Buffer; kind: UploadKind; contentType: string; ext: string }> {
  if (!file.size) {
    throw new UploadValidationError(`فایل «${file.name}» خالی است`);
  }

  const detected = detectUploadKind(file);
  if (!detected) {
    throw new UploadValidationError(
      `فرمت «${file.name}» پشتیبانی نمی‌شود. تصاویر jpg/png/webp/gif/avif بفرستید`,
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new UploadValidationError(`حجم «${file.name}» بیشتر از ۱۲ مگابایت است`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageMime(buffer);
  if (!sniffed) {
    throw new UploadValidationError(`محتوای «${file.name}» تصویر معتبر نیست`);
  }

  const ext = extensionOf(file.name) || "jpg";
  return { buffer, kind: "image", contentType: sniffed, ext: ext === "jpg" ? "jpeg" : ext };
}

export async function uploadAdminFile(
  file: File,
  options: { collectionId?: string } = {},
): Promise<UploadResult> {
  const { buffer, kind, contentType, ext } = await validateUploadFile(file);
  const folder = options.collectionId ? `collections/${options.collectionId}` : "drafts";
  const filename = `${crypto.randomUUID()}.${ext === "jpeg" ? "jpg" : ext}`;
  const pathname = `${folder}/${filename}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });

    return {
      url: blob.url,
      blobPath: blob.pathname,
      kind,
      filename: file.name,
      size: file.size,
    };
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadsDir, { recursive: true });
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  return {
    url: `/uploads/${folder}/${filename}`,
    blobPath: `local:${folder}/${filename}`,
    kind,
    filename: file.name,
    size: file.size,
  };
}

export async function uploadGalleryImage(
  file: File,
  collectionId: string,
): Promise<UploadResult> {
  return uploadAdminFile(file, { collectionId });
}

export async function deleteGalleryAsset(url: string, blobPath: string) {
  if (blobPath.startsWith("local:")) {
    const relative = blobPath.replace("local:", "");
    const filepath = path.join(process.cwd(), "public", "uploads", relative);
    try {
      await unlink(filepath);
    } catch {
      // ignore missing local files
    }
    return;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await del(url);
  }
}
