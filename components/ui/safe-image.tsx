"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function SafeImage({ className, alt, onError, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-950 text-xs text-muted-foreground",
          className,
        )}
        role="img"
        aria-label={typeof alt === "string" && alt ? alt : "بدون تصویر"}
      >
        بدون تصویر
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      {...props}
    />
  );
}
