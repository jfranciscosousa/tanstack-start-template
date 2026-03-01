import z from "zod";
import React from "react";
import { Loader2, Lock, LogIn, Mail, UserPlus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { loginFn, loginSchema } from "~/server/handlers/sessionHandlers";
import { useMutation } from "~/hooks/useMutation";
import { useFormDataValidator } from "~/hooks/useFormDataValidator";
import { renderError } from "~/errors";
import { PasswordField } from "~/components/PasswordField";
import { Avatar } from "~/components/Avatar";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (validator.validate(formData)) {
      loginMutation.mutate({
        data: formData,
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Avatar size="xl" className="h-16 w-16 rounded-xl p-4">
              <span className="text-2xl font-bold">TS</span>
            </Avatar>
          </div>
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              data-invalid={Boolean(validator.errors?.email?.length) || undefined}
            >
              <FieldLabel htmlFor="email">
                <Mail size={14} className="text-muted-foreground" />
                Email
              </FieldLabel>
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                aria-invalid={Boolean(validator.errors?.email?.length)}
                required
              />
              <FieldError errors={validator.errors?.email} />
            </Field>

            <PasswordField
              id="password"
              name="password"
              label="Password"
              icon={Lock}
              placeholder="Enter your password"
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
              className="mt-6 h-12 w-full"
              disabled={loginMutation.status === "pending"}
            >
              {loginMutation.status === "pending" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign in
                </>
              )}
            </Button>

            {Boolean(loginMutation.error) && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{renderError(loginMutation.error)}</AlertDescription>
              </Alert>
            )}

            <div className="my-4 flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-sm">Don&apos;t have an account?</span>
              <Separator className="flex-1" />
            </div>

            <Link
              to="/signup"
              search={{ redirectUrl }}
              className={buttonVariants({ variant: "outline", className: "h-12 w-full gap-2" })}
            >
              <UserPlus size={18} />
              Create account
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
