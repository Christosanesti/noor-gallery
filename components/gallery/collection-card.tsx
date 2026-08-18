"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { motion } from "framer-motion";
import { ArrowUpLeftIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CollectionCardProps = {
  slug: string;
  titleFa: string;
  excerptFa?: string | null;
  imageUrl?: string | null;
  categoryName?: string | null;
  featured?: boolean;
};

export function CollectionCard({
  slug,
  titleFa,
  excerptFa,
  imageUrl,
  categoryName,
  featured,
}: CollectionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <Link href={`/collections/${slug}`} className="block min-w-0">
        <Card className="group overflow-hidden border-white/10 bg-white/[0.03] transition-colors hover:border-amber-400/35 hover:bg-white/[0.05]">
          <div className="relative aspect-[5/6] overflow-hidden sm:aspect-[4/5]">
            {imageUrl ? (
              <SafeImage
                src={imageUrl}
                alt={titleFa}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 to-black text-sm text-muted-foreground">
                بدون تصویر
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-l from-transparent via-amber-100/15 to-transparent opacity-0 transition duration-700 group-hover:translate-x-[120%] group-hover:opacity-100" />
            <div className="absolute top-3 right-3 flex max-w-[calc(100%-1.5rem)] flex-wrap justify-end gap-1.5 sm:top-4 sm:right-4 sm:gap-2">
              {featured ? <Badge className="bg-amber-400/20 text-amber-100">ویژه</Badge> : null}
              {categoryName ? <Badge variant="secondary">{categoryName}</Badge> : null}
            </div>
            <div className="absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/40 opacity-100 backdrop-blur sm:bottom-4 sm:left-4 sm:size-10 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
              <ArrowUpLeftIcon className="size-4 text-amber-200" />
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-lg">{titleFa}</CardTitle>
          </CardHeader>
          {excerptFa ? (
            <CardContent>
              <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">{excerptFa}</p>
            </CardContent>
          ) : null}
        </Card>
      </Link>
    </motion.div>
  );
}
