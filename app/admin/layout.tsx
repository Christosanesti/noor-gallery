import { requireAdmin } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="min-h-svh overflow-x-hidden bg-black/20 lg:grid lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
      <AdminSidebar />
      <div className="p-3 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
