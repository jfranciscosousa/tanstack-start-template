import { Mail } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { buttonVariants } from "~/components/ui/button";

export const Route = createFileRoute("/_unauthed/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="relative w-full max-w-sm text-center">
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 mx-auto"
          aria-hidden="true"
        >
          <Mail size={24} className="text-primary-foreground" />
        </div>

        <h1 className="font-display text-3xl font-bold italic tracking-tight mb-2">
          Check your email.
        </h1>

        <p className="text-sm text-muted-foreground mb-6">
          We&apos;ve sent a verification link to your inbox. Click it to
          activate your account.
        </p>

        <p className="text-sm text-muted-foreground">
          Already verified?{" "}
          <Link
            to="/login"
            className={buttonVariants({
              variant: "link",
              className: "h-auto p-0 text-sm text-primary",
            })}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
