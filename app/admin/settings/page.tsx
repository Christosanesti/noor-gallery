import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/queries";

export const metadata = {
  title: "تنظیمات سایت",
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">تنظیمات سایت</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          متن صفحه اصلی، درباره ما و اطلاعات تماس
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
