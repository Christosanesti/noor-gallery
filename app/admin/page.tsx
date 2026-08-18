import Link from "next/link";
import {
  FolderKanbanIcon,
  ImageIcon,
  SparklesIcon,
  TagsIcon,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats } from "@/lib/queries";

export const metadata = {
  title: "داشبورد مدیریت",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "مجموعه‌های منتشر شده", value: stats.published, icon: FolderKanbanIcon },
    { label: "پیش‌نویس‌ها", value: stats.drafts, icon: SparklesIcon },
    { label: "تعداد تصاویر", value: stats.images, icon: ImageIcon },
    { label: "دسته‌بندی‌ها", value: stats.categories, icon: TagsIcon },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.14em] text-amber-300">خوش آمدید</p>
          <h1 className="font-heading text-3xl font-semibold">داشبورد نور گالری</h1>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/collections/new" />}
          className="bg-amber-400 text-black hover:bg-amber-300"
        >
          مجموعه جدید
        </Button>
      </div>

      <Reveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} data-reveal className="border-white/10 bg-white/[0.03] ring-1 ring-amber-400/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <Icon className="size-4 text-amber-300" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-amber-100">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </Reveal>
    </div>
  );
}
