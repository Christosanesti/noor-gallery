"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upsertSiteSettingsAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { adminKeys } from "@/lib/query-keys";

type Settings = {
  heroTitleFa: string;
  heroSubtitleFa?: string | null;
  aboutFa: string;
  addressFa?: string | null;
  phone?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
};

export function SettingsForm({ settings }: { settings?: Settings | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (formData: FormData) => upsertSiteSettingsAction(formData),
    onSuccess: async (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: adminKeys.settings() });
      toast.success("تنظیمات ذخیره شد");
      router.refresh();
    },
    onError: () => toast.error("ذخیره تنظیمات ناموفق بود"),
  });

  return (
    <form
      className="max-w-3xl space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (mutation.isPending) return;
        mutation.mutate(new FormData(event.currentTarget));
      }}
    >
      {mutation.isPending ? <Skeleton className="h-2 w-full rounded-full bg-amber-400/20" /> : null}
      <div className="space-y-2">
        <Label htmlFor="heroTitleFa">عنوان صفحه اصلی</Label>
        <Input
          id="heroTitleFa"
          name="heroTitleFa"
          defaultValue={settings?.heroTitleFa ?? ""}
          required
          disabled={mutation.isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="heroSubtitleFa">زیرعنوان</Label>
        <Input
          id="heroSubtitleFa"
          name="heroSubtitleFa"
          defaultValue={settings?.heroSubtitleFa ?? ""}
          disabled={mutation.isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="aboutFa">درباره ما</Label>
        <Textarea
          id="aboutFa"
          name="aboutFa"
          rows={8}
          defaultValue={settings?.aboutFa ?? ""}
          required
          disabled={mutation.isPending}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="addressFa">آدرس</Label>
          <Input
            id="addressFa"
            name="addressFa"
            defaultValue={settings?.addressFa ?? ""}
            disabled={mutation.isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">تلفن</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={settings?.phone ?? ""}
            dir="ltr"
            disabled={mutation.isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">اینستاگرام</Label>
          <Input
            id="instagram"
            name="instagram"
            defaultValue={settings?.instagram ?? ""}
            dir="ltr"
            disabled={mutation.isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">واتساپ</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            defaultValue={settings?.whatsapp ?? ""}
            dir="ltr"
            disabled={mutation.isPending}
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={mutation.isPending}
        className="bg-amber-400 text-black hover:bg-amber-300"
      >
        {mutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </Button>
    </form>
  );
}
