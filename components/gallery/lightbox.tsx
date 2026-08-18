"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type GalleryImage = {
  id: string;
  url: string;
  altFa?: string | null;
};

type GalleryLightboxProps = {
  images: GalleryImage[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function GalleryLightbox({
  images,
  activeIndex,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const image = activeIndex !== null ? images[activeIndex] : null;

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        onNavigate(Math.max(0, activeIndex - 1));
      }
      if (event.key === "ArrowLeft") {
        onNavigate(Math.min(images.length - 1, activeIndex + 1));
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, images.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {image ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="نمایش تصویر گالری"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-10"
            onClick={onClose}
            aria-label="بستن"
          >
            <XIcon />
          </Button>

          {activeIndex !== null && activeIndex > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 z-10 sm:right-4"
              aria-label="تصویر قبلی"
              onClick={(event) => {
                event.stopPropagation();
                onNavigate(activeIndex - 1);
              }}
            >
              <ChevronRightIcon />
            </Button>
          ) : null}

          {activeIndex !== null && activeIndex < images.length - 1 ? (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 z-10 sm:left-4"
              aria-label="تصویر بعدی"
              onClick={(event) => {
                event.stopPropagation();
                onNavigate(activeIndex + 1);
              }}
            >
              <ChevronLeftIcon />
            </Button>
          ) : null}

          <motion.div
            key={image.id}
            className="relative h-[min(70svh,32rem)] w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 sm:h-[min(75svh,40rem)] sm:rounded-2xl"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={image.url}
              alt={image.altFa ?? "تصویر گالری"}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
