import z from "zod";
import React from "react";
import { Eye, Loader2, Lock, Mail, User, UserPlus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";

import { signUpSchema, signupFn } from "~/server/handlers/userHandlers";
import { useMutation } from "~/hooks/useMutation";
import { useFormDataValidator } from "~/hooks/useFormDataValidator";
import { renderError } from "~/errors";
import { PasswordField } from "~/components/PasswordField";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (validator.validate(formData)) {
      signupMutation.mutate({
        data: formData,
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <span className="text-2xl text-primary-foreground">💰</span>
          </div>
          <CardTitle className="text-2xl">
            Tanstack start drizzle template
          </CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              data-invalid={Boolean(validator.errors?.name?.length) || undefined}
            >
              <FieldLabel htmlFor="name">
                <User size={14} className="text-muted-foreground" />
                Name
              </FieldLabel>
              <Input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your full name"
                aria-invalid={Boolean(validator.errors?.name?.length)}
                required
              />
              <FieldError errors={validator.errors?.name} />
            </Field>

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
              placeholder="Create a password"
              errors={validator.errors?.password}
              required
              minLength={6}
            />

            <PasswordField
              id="passwordConfirmation"
              name="passwordConfirmation"
              label="Confirm password"
              icon={Eye}
              placeholder="Confirm your password"
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
              className="mt-6 w-full"
              disabled={signupMutation.status === "pending"}
            >
              {signupMutation.status === "pending" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create account
                </>
              )}
            </Button>

            {Boolean(signupMutation.error) && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  {renderError(signupMutation.error)}
                </AlertDescription>
              </Alert>
            )}

            <div className="my-4 flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-sm">
                Already have an account?
              </span>
              <Separator className="flex-1" />
            </div>

            <Link
              to="/login"
              search={loginSearch}
              className={buttonVariants({
                variant: "outline",
                className: "w-full",
              })}
            >
              Sign in
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
