import z from "zod";
import React from "react";
import { Eye, Loader2, Mail, User, UserPlus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";

import { signUpSchema, signupFn } from "~/server/handlers/userHandlers";
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

export const Route = createFileRoute("/_unauthed/signup")({
  component: SignUp,
  validateSearch: (search) => searchSchema.parse(search),
});

function SignUp() {
  const { redirectUrl } = Route.useSearch();
  const router = useRouter();
  const signupMutation = useMutation({
    fn: useServerFn(signupFn),
    onSuccess: async () => {
      await router.invalidate();
    },
  });
  const validator = useFormDataValidator(signUpSchema);
  const loginSearch = { redirectUrl };

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget as HTMLFormElement);

    if (validator.validate(formData)) {
      signupMutation.mutate({
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
            Create account.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started — it only takes a moment
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xl shadow-black/20 ring-1 ring-foreground/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              data-invalid={Boolean(validator.errors?.name?.length) || undefined}
            >
              <FieldLabel htmlFor="name">
                <User size={13} className="text-muted-foreground" aria-hidden="true" />
                Name
              </FieldLabel>
              <Input
                type="text"
                name="name"
                id="name"
                placeholder="Your full name"
                autoComplete="name"
                aria-invalid={Boolean(validator.errors?.name?.length)}
                required
              />
              <FieldError errors={validator.errors?.name} />
            </Field>

            <Field
              data-invalid={Boolean(validator.errors?.email?.length) || undefined}
            >
              <FieldLabel htmlFor="email">
                <Mail size={13} className="text-muted-foreground" aria-hidden="true" />
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
              placeholder="Create a password"
              autoComplete="new-password"
              errors={validator.errors?.password}
              required
              minLength={6}
            />

            <PasswordField
              id="passwordConfirmation"
              name="passwordConfirmation"
              label="Confirm password"
              icon={Eye}
              placeholder="Repeat your password"
              autoComplete="new-password"
              errors={validator.errors?.passwordConfirmation}
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
              disabled={signupMutation.status === "pending"}
            >
              {signupMutation.status === "pending" ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Creating account&hellip;
                </>
              ) : (
                <>
                  <UserPlus size={16} aria-hidden="true" />
                  Create account
                </>
              )}
            </Button>

            {Boolean(signupMutation.error) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {renderError(signupMutation.error)}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </div>

        {/* Sign in link */}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            search={loginSearch}
            className={buttonVariants({ variant: "link", className: "h-auto p-0 text-sm text-primary" })}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
