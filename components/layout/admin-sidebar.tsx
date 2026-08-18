"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanbanIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  TagsIcon,
} from "lucide-react";
import { AdminMonogram } from "@/components/layout/admin-monogram";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboardIcon },
  { href: "/admin/collections", label: "مجموعه‌ها", icon: FolderKanbanIcon },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: TagsIcon },
  { href: "/admin/settings", label: "تنظیمات", icon: SettingsIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      data-testid="admin-sidebar"
      className="flex w-full min-w-0 flex-col overflow-x-hidden border-b border-amber-400/10 bg-black/40 p-3 sm:p-4 lg:h-full lg:w-72 lg:border-b-0 lg:border-l lg:border-amber-400/10"
    >
      <div className="mb-3 flex items-center justify-between gap-3 lg:mb-8">
        <div className="flex min-w-0 items-center gap-3">
          <AdminMonogram className="size-10 text-base" />
          <div className="min-w-0">
            <p className="text-xs text-amber-300">پنل مدیریت</p>
            <p className="font-heading truncate text-base font-semibold lg:text-lg">نور گالری</p>
          </div>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="icon" aria-label="خروج" className="text-muted-foreground hover:text-amber-200">
            <LogOutIcon />
          </Button>
        </form>
      </div>

      <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:overflow-visible">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors lg:gap-3 lg:py-2.5",
                active
                  ? "bg-amber-400/15 text-amber-100"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <Link href="/" className="mt-3 text-sm text-muted-foreground hover:text-amber-200 lg:mt-6">
        بازگشت به سایت
      </Link>
    </aside>
  );
}
