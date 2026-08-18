"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import { motion } from "framer-motion";
import { GalleryLightbox } from "@/components/gallery/lightbox";

type GalleryImage = {
  id: string;
  url: string;
  altFa?: string | null;
};

export function GalleryGrid({
  images,
  featured = false,
}: {
  images: GalleryImage[];
  featured?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const hero = featured ? images[0] : null;
  const rest = featured ? images.slice(1) : images;

  return (
    <>
      {hero ? (
        <motion.button
          type="button"
          className="group relative mb-5 min-h-[min(62svh,36rem)] w-full overflow-hidden rounded-[1.75rem] border border-white/10 sm:mb-7 sm:rounded-[2rem]"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          onClick={() => setActiveIndex(0)}
        >
          <SafeImage
            src={hero.url}
            alt={hero.altFa ?? "تصویر شاخص مجموعه"}
            fill
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <span className="absolute bottom-5 right-5 rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-xs text-amber-100 backdrop-blur">
            بزرگ‌نمایی
          </span>
        </motion.button>
      ) : null}

      {rest.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {rest.map((image, index) => {
            const lightboxIndex = featured ? index + 1 : index;
            return (
              <motion.button
                key={image.id}
                type="button"
                className="group relative aspect-[5/6] overflow-hidden rounded-2xl border border-white/10 sm:aspect-[4/5]"
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveIndex(lightboxIndex)}
              >
                <SafeImage
                  src={image.url}
                  alt={image.altFa ?? "تصویر گالری"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              </motion.button>
            );
          })}
        </div>
      ) : null}

      <GalleryLightbox
        images={images}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </>
  );
}
