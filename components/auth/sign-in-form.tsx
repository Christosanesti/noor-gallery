"use client";

import { motion } from "framer-motion";
import { Loader2Icon, LockIcon, MailIcon } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { loginAction } from "@/app/sign-in/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <motion.form
      data-testid="sign-in-form"
      action={formAction}
      className="w-full space-y-5 text-right"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="space-y-2">
        <Label htmlFor="email">ایمیل مدیر</Label>
        <div className="relative">
          <MailIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-amber-300/80" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            dir="ltr"
            data-testid="sign-in-email"
            className="h-11 pr-10 text-left"
            placeholder="navophoto@protonmail.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">رمز عبور</Label>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-amber-300/80" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            dir="ltr"
            data-testid="sign-in-password"
            className="h-11 pr-10 text-left"
          />
        </div>
      </div>

      {state?.error ? (
        <p
          data-testid="sign-in-error"
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        data-testid="sign-in-submit"
        disabled={pending}
        className="h-11 w-full bg-amber-400 text-black hover:bg-amber-300"
      >
        {pending ? (
          <>
            <Loader2Icon className="animate-spin" />
            در حال ورود...
          </>
        ) : (
          "ورود به پنل"
        )}
      </Button>
    </motion.form>
  );
}
