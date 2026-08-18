import { Suspense } from "react";
import { FeaturedCollections, FeaturedCollectionsSkeleton } from "@/components/home/featured-collections";
import { HeroSection } from "@/components/home/hero-section";
import { Reveal } from "@/components/motion/reveal";
import { getSiteSettings } from "@/lib/queries";

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <HeroSection
        title={settings?.heroTitleFa ?? "نور گالری، نمایشگاهی از نور و جزئیات"}
        subtitle={
          settings?.heroSubtitleFa ??
          "مجموعه‌ای منتخب از لوستر، آباژور و روشنایی معماری با طراحی شیک و تجربه‌ای لوکس."
        }
      />
      <Suspense fallback={<FeaturedCollectionsSkeleton />}>
        <FeaturedCollections />
      </Suspense>
      <section className="mx-auto max-w-7xl overflow-x-hidden px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <Reveal>
          <div
            data-reveal
            className="relative overflow-hidden rounded-[1.75rem] border border-amber-400/15 bg-gradient-to-br from-amber-400/10 via-white/[0.03] to-violet-500/10 p-7 sm:rounded-[2rem] sm:p-10 md:p-14"
          >
            <div className="pointer-events-none absolute -top-16 left-10 size-48 rounded-full bg-amber-400/15 blur-3xl" />
            <p className="text-sm tracking-[0.18em] text-amber-300">درباره نور گالری</p>
            <h2 className="font-heading mt-3 text-2xl font-semibold sm:text-3xl md:text-4xl">فضایی برای دیدن نور</h2>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-muted-foreground sm:text-base sm:leading-9">
              {settings?.aboutFa ??
                "نور گالری فضایی برای کشف لوستر، لامپ و روشنایی معماری است؛ جایی که جزئیات، بافت و درخشش هر اثر با دقت نمایش داده می‌شود."}
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
