import type { ReactNode } from "react";

import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";

import { buttonVariants } from "~/components/ui/button";

export function NotFound({ children }: { children?: ReactNode }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  function handleGoBack() {
    if (canGoBack && window.history.length > 1) {
      router.history.back();
      return;
    }

    void router.navigate({ to: "/" });
  }

  return (
    <div className="container mx-auto max-w-5xl px-5 py-8">
      <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
        Page not found
      </h1>
      <div className="mt-2 text-sm text-muted-foreground">
        {children || <p>The page you are looking for does not exist.</p>}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleGoBack}
          className={buttonVariants()}
        >
          Go back
        </button>
        <Link to="/" className={buttonVariants({ variant: "outline" })}>
          Back to tasks
        </Link>
      </div>
    </div>
  );
}
