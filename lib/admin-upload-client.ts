export type ClientUploadFile = {
  url: string;
  blobPath: string;
  kind: "image";
  filename: string;
  size: number;
};

export type UploadProgressHandler = (percent: number) => void;

export async function postAdminUpload(options: {
  files: File[];
  collectionId?: string;
  onProgress?: UploadProgressHandler;
  signal?: AbortSignal;
}): Promise<ClientUploadFile[]> {
  const { files, collectionId, onProgress, signal } = options;
  if (!files.length) {
    throw new Error("فایلی انتخاب نشده است");
  }

  const formData = new FormData();
  if (collectionId) formData.append("collectionId", collectionId);
  formData.append("kind", "image");
  files.forEach((file) => formData.append("files", file));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.max(1, Math.round((event.loaded / event.total) * 100)));
    };

    const abort = () => xhr.abort();
    signal?.addEventListener("abort", abort, { once: true });

    xhr.onload = () => {
      signal?.removeEventListener("abort", abort);
      const payload = xhr.response as
        | {
            error?: string;
            files?: ClientUploadFile[];
            uploads?: ClientUploadFile[];
          }
        | null;

      if (xhr.status >= 200 && xhr.status < 300) {
        const filesResult = payload?.files ?? payload?.uploads ?? [];
        if (!filesResult.length) {
          reject(new Error(payload?.error ?? "آپلود نتیجه‌ای نداشت"));
          return;
        }
        onProgress?.(100);
        resolve(filesResult);
        return;
      }

      reject(new Error(payload?.error ?? "خطا در آپلود فایل"));
    };

    xhr.onerror = () => {
      signal?.removeEventListener("abort", abort);
      reject(new Error("ارتباط با سرور آپلود برقرار نشد"));
    };

    xhr.onabort = () => {
      signal?.removeEventListener("abort", abort);
      reject(new Error("آپلود لغو شد"));
    };

    xhr.send(formData);
  });
}
