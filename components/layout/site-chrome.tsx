"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const isAdmin = pathname.startsWith("/admin");
  const isAuth = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (isAdmin || isAuth) {
    return <div className="flex min-h-svh min-w-0 flex-1 flex-col overflow-x-hidden">{children}</div>;
  }

  return (
    <>
      {header}
      <motion.main
        key={pathname}
        className="min-w-0 flex-1 overflow-x-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
      {footer}
    </>
  );
}
