"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";
import { HERO_PHOTO, HERO_PHOTO_ALT } from "@/lib/media";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type HeroSectionProps = {
  title: string;
  subtitle?: string | null;
};

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = containerRef.current;
      const stage = root?.querySelector<HTMLElement>(".hero-stage");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          ".hero-badge, .hero-title-inner, .hero-copy, .hero-cta, .hero-photo, .hero-flare, .hero-sweep",
          { clearProps: "all" },
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".hero-photo", { scale: 1.16, duration: 2.1, ease: "power2.out" })
          .from(".hero-flare", { autoAlpha: 0, scale: 0.7, duration: 1.15, stagger: 0.12 }, 0.15)
          .fromTo(
            ".hero-sweep",
            { xPercent: 70, autoAlpha: 0 },
            { xPercent: -90, autoAlpha: 1, duration: 1.7, ease: "power2.inOut" },
            0.2,
          )
          .from(".hero-badge", { y: 18, autoAlpha: 0, duration: 0.55 }, 0.42)
          .from(".hero-title-inner", { yPercent: 118, duration: 1.05, ease: "power4.out" }, 0.5)
          .from(".hero-copy", { y: 18, autoAlpha: 0, duration: 0.55 }, 0.88)
          .from(".hero-cta", { y: 16, autoAlpha: 0, duration: 0.45, stagger: 0.1 }, 1.02);

        if (root && stage) {
          const xTo = gsap.quickTo(stage, "x", { duration: 0.9, ease: "power3.out" });
          const yTo = gsap.quickTo(stage, "y", { duration: 0.9, ease: "power3.out" });

          const onMove = (event: PointerEvent) => {
            const rect = root.getBoundingClientRect();
            const nx = (event.clientX - rect.left) / rect.width - 0.5;
            const ny = (event.clientY - rect.top) / rect.height - 0.5;
            xTo(nx * -14);
            yTo(ny * -10);
          };

          root.addEventListener("pointermove", onMove);

          ScrollTrigger.create({
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 0.7,
            onUpdate: (self) => {
              gsap.set(stage, { yPercent: self.progress * 8 });
            },
          });

          return () => {
            root.removeEventListener("pointermove", onMove);
          };
        }
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative isolate min-h-[100svh] overflow-x-hidden"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="hero-stage absolute inset-[-8%] will-change-transform">
          <div className="relative h-full w-full">
            <SafeImage
              src={HERO_PHOTO}
              alt={HERO_PHOTO_ALT}
              fill
              priority
              className="hero-photo object-cover object-[center_18%]"
              sizes="100vw"
            />
          </div>
          <div className="hero-flare absolute top-[-12%] left-1/2 h-[58%] w-[78%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,214,120,0.38),transparent_62%)] blur-3xl" />
          <div className="hero-flare absolute top-[8%] right-[6%] h-[42%] w-[38%] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.22),transparent_70%)] blur-3xl" />
          <div className="hero-flare absolute bottom-[12%] left-[4%] h-[36%] w-[34%] bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.14),transparent_72%)] blur-3xl" />
          <div className="hero-sweep absolute inset-y-0 w-1/3 bg-gradient-to-l from-transparent via-amber-100/18 to-transparent will-change-transform" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,transparent_0%,rgba(10,9,14,0.22)_42%,rgba(10,9,14,0.78)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
        <div className="hero-grain absolute inset-0 opacity-[0.08] mix-blend-overlay" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full min-w-0 max-w-7xl flex-col justify-end px-4 pt-24 pb-16 sm:justify-center sm:px-6 sm:pt-28 sm:pb-20 lg:px-8">
        <div className="max-w-3xl min-w-0 space-y-6 text-center sm:space-y-7 lg:text-right">
          <p className="hero-badge inline-flex rounded-full border border-amber-400/40 bg-amber-400/12 px-4 py-1.5 text-[11px] tracking-[0.18em] text-amber-100 shadow-[0_0_28px_rgba(255,214,120,0.22)]">
            نمایشگاه اختصاصی نور
          </p>
          <h1
            data-testid="hero-heading"
            className="hero-title font-heading mx-auto max-w-[18ch] overflow-hidden text-[2rem] leading-[1.4] font-semibold text-balance drop-shadow-[0_10px_36px_rgba(8,7,12,0.7)] sm:text-5xl md:text-6xl lg:mx-0 lg:text-7xl"
          >
            <span className="hero-title-inner inline-block will-change-transform">{title}</span>
          </h1>
          {subtitle ? (
            <p className="hero-copy mx-auto max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base sm:leading-9 md:text-lg lg:mx-0">
              {subtitle}
            </p>
          ) : null}
          <div className="hero-actions flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <div className="hero-cta w-full sm:w-auto">
              <Button
                nativeButton={false}
                render={<Link href="/collections" />}
                className="h-12 w-full bg-amber-400 text-black shadow-[0_0_32px_rgba(251,191,36,0.28)] hover:bg-amber-300 sm:h-11"
              >
                کاوش مجموعه‌ها
              </Button>
            </div>
            <div className="hero-cta w-full sm:w-auto">
              <Button
                nativeButton={false}
                variant="outline"
                render={<Link href="/contact" />}
                className="h-12 w-full border-white/15 bg-background/25 backdrop-blur-md sm:h-11"
              >
                رزرو بازدید
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
