import { cn } from "@/lib/utils";

export function AdminMonogram({ className }: { className?: string }) {
  return (
    <span
      data-testid="admin-monogram"
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full border border-amber-400/45 bg-amber-400/10 font-heading text-sm font-bold text-amber-300",
        className,
      )}
    >
      ن
    </span>
  );
}
