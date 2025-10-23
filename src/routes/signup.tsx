import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Eye, Loader2, Lock, Mail, User } from "lucide-react";
import z from "zod";
import { PasswordInput } from "~/components/PasswordInput";
import { TextInput } from "~/components/TextInput";
import { renderError } from "~/errors";
import { useFormDataValidator } from "~/hooks/useFormDataValidator";
import { useMutation } from "~/hooks/useMutation";
import { signupFn, signUpSchema } from "~/server/handlers/userHandlers";

const searchSchema = z.object({
  redirectUrl: z.string().optional(),
});

export const Route = createFileRoute("/signup")({
  validateSearch: search => searchSchema.parse(search),
  component: SignUp,
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    if (validator.validate(formData)) {
      signupMutation.mutate({
        data: formData,
      });
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-primary-content">💰</span>
            </div>
            <h1 className="card-title text-2xl justify-center">
              Tanstack start drizzle template
            </h1>
            <p className="text-base-content/70 mt-2">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              type="text"
              name="name"
              id="name"
              label="Name"
              icon={User}
              placeholder="Enter your full name"
              error={validator.errors?.properties?.name?.errors}
              required
            />

            <TextInput
              type="email"
              name="email"
              id="email"
              label="Email"
              icon={Mail}
              placeholder="Enter your email"
              error={validator.errors?.properties?.email?.errors}
              required
            />

            <PasswordInput
              name="password"
              id="password"
              label="Password"
              icon={Lock}
              placeholder="Create a password"
              error={validator.errors?.properties?.password?.errors}
              required
              minLength={6}
            />

            <PasswordInput
              name="passwordConfirmation"
              id="passwordConfirmation"
              label="Confirm password"
              icon={Eye}
              placeholder="Confirm your password"
              error={validator.errors?.properties?.passwordConfirmation?.errors}
              required
              minLength={6}
            />

            <input
              type="hidden"
              name="redirectUrl"
              defaultValue={redirectUrl}
            />

            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={signupMutation.status === "pending"}
            >
              {signupMutation.status === "pending" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>

            {!!signupMutation.error && (
              <div className="alert alert-error mt-4">
                {renderError(signupMutation.error)}
              </div>
            )}

            <div className="divider text-base-content/70">
              Already have an account?
            </div>
            <Link
              to="/login"
              search={{ redirectUrl }}
              className="btn btn-outline btn-block"
            >
              Sign in
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
