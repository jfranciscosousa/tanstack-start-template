import { Link, useRouter } from "@tanstack/react-router";

import { authClient } from "~/lib/auth-client";
import { signUpSchema } from "~/schemas/user-schemas";
import { Route } from "~/routes/_unauthed/signup";
import { Button, buttonVariants } from "~/components/ui/button";
import { Form } from "~/components/form/form";

export default function SignupPage() {
  const { redirectUrl } = Route.useSearch();
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient glow effects */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/8 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 -translate-x-1/3 translate-y-1/3 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

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
            Create account.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started — it only takes a moment
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xl shadow-black/20 ring-1 ring-foreground/5">
          <Form
            schema={signUpSchema}
            defaultValues={{
              name: "",
              email: "",
              password: "",
              passwordConfirmation: "",
              redirectUrl: redirectUrl ?? "",
            }}
            fields={[
              {
                name: "name",
                label: "Name",
                type: "text",
                placeholder: "Your full name",
                required: true,
              },
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
                placeholder: "Create a password",
                required: true,
              },
              {
                name: "passwordConfirmation",
                label: "Confirm password",
                type: "password",
                placeholder: "Repeat your password",
                required: true,
                validate: (value, values) => {
                  if (values.password && value !== values.password) {
                    return "Passwords must match";
                  }
                },
              },
            ]}
            onSubmit={async values => {
              const { error } = await authClient.signUp.email({
                name: values.name,
                email: values.email,
                password: values.password,
              });
              if (error) throw new Error(error.message);
              await router.navigate({ to: "/verify-email" });
            }}
            renderSubmit={form => (
              <form.Subscribe selector={state => state.isSubmitting}>
                {isSubmitting => (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>
                )}
              </form.Subscribe>
            )}
          />
        </div>

        {/* Sign in link */}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            search={{ redirectUrl }}
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
