import z from "zod";
import React from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { loginFn, loginSchema } from "~/server/handlers/sessionHandlers";
import { useMutation } from "~/hooks/useMutation";
import { useFormDataValidator } from "~/hooks/useFormDataValidator";
import { renderError } from "~/errors";
import { PasswordField } from "~/components/PasswordField";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";

const searchSchema = z.object({
  redirectUrl: z.string().optional(),
});

export const Route = createFileRoute("/_unauthed/login")({
  component: Login,
  validateSearch: search => searchSchema.parse(search),
});

function Login() {
  const { redirectUrl } = Route.useSearch();
  const router = useRouter();
  const fn = useServerFn(loginFn);
  const loginMutation = useMutation({
    fn,
    onSuccess: async () => {
      await router.invalidate();
    },
  });
  const validator = useFormDataValidator(loginSchema);

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget as HTMLFormElement);

    if (validator.validate(formData)) {
      loginMutation.mutate({
        data: formData,
      });
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/8 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 -translate-x-1/3 translate-y-1/3 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-sm">
        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20" aria-hidden="true">
            <span className="font-display text-xl font-bold italic text-primary-foreground leading-none">T</span>
          </div>
          <h1 className="font-display text-3xl font-bold italic tracking-tight">
            Welcome back.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue to your workspace
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xl shadow-black/20 ring-1 ring-foreground/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              data-invalid={Boolean(validator.errors?.email?.length) || undefined}
            >
              <FieldLabel htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </FieldLabel>
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="you@example.com"
                autoComplete="email"
                spellCheck={false}
                aria-invalid={Boolean(validator.errors?.email?.length)}
                required
              />
              <FieldError errors={validator.errors?.email} />
            </Field>

            <PasswordField
              id="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              errors={validator.errors?.password}
              required
              minLength={6}
            />

            <input
              type="hidden"
              name="redirectUrl"
              defaultValue={redirectUrl}
            />

            <Button
              type="submit"
              className="mt-2 h-10 w-full gap-2"
              disabled={loginMutation.status === "pending"}
            >
              {loginMutation.status === "pending" ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Signing in&hellip;
                </>
              ) : (
                <>
                  <LogIn size={16} aria-hidden="true" />
                  Sign in
                </>
              )}
            </Button>

            {Boolean(loginMutation.error) && (
              <Alert variant="destructive">
                <AlertDescription>{renderError(loginMutation.error)}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>

        {/* Sign up link */}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            search={{ redirectUrl }}
            className={buttonVariants({ variant: "link", className: "h-auto p-0 text-sm text-primary" })}
          >
            <UserPlus size={14} aria-hidden="true" />
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
