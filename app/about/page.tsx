import { Reveal } from "@/components/motion/reveal";
import { SafeImage } from "@/components/ui/safe-image";
import { HERO_PHOTO, HERO_PHOTO_ALT } from "@/lib/media";
import { getSiteSettings } from "@/lib/queries";

export const metadata = {
  title: "درباره ما",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-5xl min-w-0 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <Reveal className="space-y-8">
        <div data-reveal>
          <p className="text-sm tracking-[0.16em] text-amber-300">داستان نور گالری</p>
          <h1 className="font-heading mt-2 text-3xl font-semibold sm:text-4xl md:text-5xl">درباره نور گالری</h1>
        </div>
        <div
          data-reveal
          className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] border border-white/10 sm:rounded-[2rem]"
        >
          <SafeImage
            src={HERO_PHOTO}
            alt={HERO_PHOTO_ALT}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 64rem"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
        <div
          data-reveal
          className="whitespace-pre-line text-sm leading-8 text-muted-foreground sm:text-base sm:leading-9"
        >
          {settings?.aboutFa ??
            "نور گالری با تمرکز بر لوستر، آباژور و روشنایی معماری شکل گرفته است؛ جایی که هر اثر با جزئیات، بافت و کیفیت نور نمایش داده می‌شود."}
        </div>
      </Reveal>
    </div>
  );
}
