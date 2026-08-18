import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminMonogram } from "@/components/layout/admin-monogram";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = {
  title: "ورود",
};

export default async function SignInPage() {
  const session = await auth();
  if (session?.user?.email) {
    redirect("/admin");
  }

  return (
    <div className="relative overflow-x-hidden px-4 py-10 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.16),transparent_42%)]" />
      <div className="relative mx-auto flex min-h-[min(72svh,40rem)] w-full max-w-md flex-col items-center justify-center gap-8">
        <div className="space-y-3 text-center">
          <AdminMonogram className="mx-auto size-12 text-lg text-amber-200" />
          <p className="text-sm tracking-[0.22em] text-amber-300">پنل مدیریت</p>
          <h1 className="font-heading text-3xl font-semibold">ورود به نور گالری</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            فقط مدیر سایت می‌تواند وارد شود. ثبت‌نام وجود ندارد.
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
