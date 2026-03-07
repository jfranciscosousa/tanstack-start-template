import { LogIn, UserPlus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Link, useRouter } from "@tanstack/react-router";

import { Route } from "~/routes/_unauthed/login";
import { loginFn } from "~/server/handlers/session-handlers";
import { loginSchema } from "~/schemas/session-schemas";
import { Form } from "~/components/form/form";
import { Button, buttonVariants } from "~/components/ui/button";

export default function LoginPage() {
  const { redirectUrl } = Route.useSearch();
  const router = useRouter();
  const login = useServerFn(loginFn);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="relative w-full max-w-sm">
        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20"
            aria-hidden="true"
          >
            <span className="font-display text-xl font-bold italic text-primary-foreground leading-none">
              T
            </span>
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
          <Form
            schema={loginSchema}
            defaultValues={{
              email: "",
              password: "",
              redirectUrl: redirectUrl ?? "",
            }}
            fields={[
              {
                name: "email",
                label: "Email",
                type: "email",
                placeholder: "you@example.com",
                required: true,
              },
              {
                name: "password",
                label: "Password",
                type: "password",
                placeholder: "••••••••",
                required: true,
              },
            ]}
            onSubmit={async (values) => {
              await login({ data: values });
              await router.invalidate();
            }}
            renderSubmit={(form) => (
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Signing in&hellip;</>
                    ) : (
                      <>
                        <LogIn size={16} aria-hidden="true" />
                        Sign in
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            )}
          />
        </div>

        {/* Sign up link */}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            search={{ redirectUrl }}
            className={buttonVariants({
              variant: "link",
              className: "h-auto p-0 text-sm text-primary",
            })}
          >
            <UserPlus size={14} aria-hidden="true" />
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
