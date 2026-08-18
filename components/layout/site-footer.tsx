import Link from "next/link";
import { Globe, PhoneIcon } from "lucide-react";
import { getSiteSettings } from "@/lib/queries";

export async function SiteFooter() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t border-white/10 bg-black/45">
      <div className="mx-auto grid min-w-0 max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-heading text-lg font-semibold text-amber-200 sm:text-xl">نور گالری</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
            نمایشگاه تخصصی لوستر، آباژور و روشنایی معماری با طراحی شیک و تجربه‌ای لوکس.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">دسترسی سریع</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground md:flex-col">
            <Link href="/collections" className="hover:text-amber-200">
              مجموعه‌ها
            </Link>
            <Link href="/about" className="hover:text-amber-200">
              درباره ما
            </Link>
            <Link href="/contact" className="hover:text-amber-200">
              تماس
            </Link>
          </div>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          {settings?.phone ? (
            <p className="flex items-center gap-2">
              <PhoneIcon className="size-4 shrink-0 text-amber-300" />
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-amber-200" dir="ltr">
                {settings.phone}
              </a>
            </p>
          ) : null}
          {settings?.instagram ? (
            <a
              href={settings.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-amber-200"
            >
              <Globe className="size-4 shrink-0 text-amber-300" />
              اینستاگرام
            </a>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} نور گالری — تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}
