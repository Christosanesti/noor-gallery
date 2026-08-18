import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/auth/admin";
import {
  UploadValidationError,
  uploadAdminFile,
} from "@/lib/upload";
import { uploadRequestSchema } from "@/lib/validations";

export const runtime = "nodejs";
export const maxDuration = 60;

function adminErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "FORBIDDEN";
  return NextResponse.json(
    { error: message === "UNAUTHORIZED" ? "لطفاً وارد شوید" : "دسترسی مجاز نیست" },
    { status: message === "UNAUTHORIZED" ? 401 : 403 },
  );
}

export async function POST(request: Request) {
  try {
    await assertAdminApi();
  } catch (error) {
    return adminErrorResponse(error);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "درخواست آپلود نامعتبر است" }, { status: 400 });
  }

  const parsed = uploadRequestSchema.safeParse({
    collectionId: String(formData.get("collectionId") ?? "") || undefined,
    kind: String(formData.get("kind") ?? "image") || "image",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "درخواست نامعتبر است" },
      { status: 400 },
    );
  }

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (!files.length) {
    return NextResponse.json({ error: "فایلی انتخاب نشده است" }, { status: 400 });
  }

  const uploads = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const result = await uploadAdminFile(file, {
        collectionId: parsed.data.collectionId,
      });
      uploads.push(result);
    } catch (error) {
      if (error instanceof UploadValidationError) {
        errors.push(error.message);
        continue;
      }
      console.error("upload failed", error);
      errors.push(`آپلود «${file.name}» ناموفق بود`);
    }
  }

  if (!uploads.length) {
    return NextResponse.json(
      { error: errors[0] ?? "هیچ فایلی آپلود نشد", errors },
      { status: 400 },
    );
  }

  return NextResponse.json({
    files: uploads,
    uploads,
    errors: errors.length ? errors : undefined,
  });
}
