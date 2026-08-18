"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "خانه" },
  { href: "/collections", label: "مجموعه‌ها" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 border-b border-white/10 bg-background/78 backdrop-blur-2xl"
    >
      <div className="mx-auto flex h-[4.5rem] min-w-0 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.75rem] sm:px-8 lg:px-10">
        <Link
          href="/"
          data-testid="site-brand"
          className="flex min-w-0 shrink items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 shadow-[0_0_24px_rgba(212,175,55,0.12)] sm:px-4 sm:py-2"
        >
          <span className="flex min-w-0 flex-col justify-center gap-0.5">
            <span className="font-heading truncate text-base font-semibold tracking-tight text-amber-100 sm:text-lg">
              نور گالری
            </span>
            <span className="hidden text-[11px] leading-none text-muted-foreground sm:block">
              نمایشگاه لوستر و روشنایی
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm transition-colors",
                pathname === link.href
                  ? "text-amber-100"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {pathname === link.href ? (
                <motion.span
                  layoutId="public-nav-pill"
                  className="absolute inset-0 rounded-full bg-amber-400/15"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            className="hidden border-amber-400/30 lg:inline-flex"
            render={<Link href="/collections" />}
          >
            مشاهده مجموعه‌ها
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="باز کردن منو"
                />
              }
            >
              <MenuIcon />
              <span className="sr-only">منو</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(88vw,360px)] max-w-full border-white/10 bg-background">
              <SheetHeader>
                <SheetTitle>منوی نور گالری</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-4 py-3 text-sm transition-colors",
                      pathname === link.href
                        ? "bg-amber-400/15 text-amber-200"
                        : "text-muted-foreground hover:bg-white/5",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/collections"
                  onClick={() => setOpen(false)}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-amber-400 px-4 text-sm font-medium text-black hover:bg-amber-300"
                >
                  مشاهده مجموعه‌ها
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <motion.div
        className="h-px origin-center bg-gradient-to-r from-transparent via-amber-400/70 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </header>
  );
}
