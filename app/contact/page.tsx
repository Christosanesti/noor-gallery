import Link from "next/link";
import { Globe, MapPinIcon, PhoneIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { getSiteSettings } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "تماس",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-5xl min-w-0 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm tracking-[0.16em] text-amber-300">ارتباط با ما</p>
        <h1 className="font-heading mt-2 text-3xl font-semibold sm:text-4xl md:text-5xl">تماس با نور گالری</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">
          برای بازدید حضوری، مشاوره انتخاب لوستر یا دریافت اطلاعات بیشتر با ما در ارتباط باشید.
        </p>
      </div>

      <Reveal className="mt-10 grid gap-4 md:grid-cols-3">
        <Card data-reveal className="border-white/10 bg-white/[0.03] transition-colors hover:border-amber-400/25">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPinIcon className="size-4 text-amber-300" />
              آدرس
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            {settings?.addressFa ?? "آدرس به‌زودی ثبت می‌شود."}
          </CardContent>
        </Card>

        <Card data-reveal className="border-white/10 bg-white/[0.03] transition-colors hover:border-amber-400/25">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PhoneIcon className="size-4 text-amber-300" />
              تلفن
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground" dir="ltr">
            {settings?.phone ? (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-amber-200">
                {settings.phone}
              </a>
            ) : (
              "—"
            )}
          </CardContent>
        </Card>

        <Card data-reveal className="border-white/10 bg-white/[0.03] transition-colors hover:border-amber-400/25">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="size-4 text-amber-300" />
              شبکه‌های اجتماعی
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings?.instagram ? (
              <Link
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-amber-200 hover:underline"
              >
                اینستاگرام
              </Link>
            ) : null}
            {settings?.whatsapp ? (
              <Link
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-amber-200 hover:underline"
              >
                واتساپ
              </Link>
            ) : null}
            {!settings?.instagram && !settings?.whatsapp ? (
              <p className="text-sm text-muted-foreground">اطلاعات شبکه‌های اجتماعی به‌زودی.</p>
            ) : null}
          </CardContent>
        </Card>
      </Reveal>

      <div className="mt-10">
        <Button
          nativeButton={false}
          render={<Link href="/collections" />}
          className="h-11 w-full bg-amber-400 text-black hover:bg-amber-300 sm:h-9 sm:w-auto"
        >
          مشاهده مجموعه‌ها
        </Button>
      </div>
    </div>
  );
}
