import { createFileRoute } from "@tanstack/react-router";
import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Lock, Mail, LogIn, UserPlus } from "lucide-react";
import z from "zod";
import { Avatar } from "~/components/Avatar";
import { PasswordInput } from "~/components/PasswordInput";
import { TextInput } from "~/components/TextInput";
import { renderError } from "~/errors";
import { useFormDataValidator } from "~/hooks/useFormDataValidator";
import { useMutation } from "~/hooks/useMutation";
import { loginFn, loginSchema } from "~/server/sessions";

const searchSchema = z.object({
  redirectUrl: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: search => searchSchema.parse(search),
  component: Login,
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    if (validator.validate(formData)) {
      loginMutation.mutate({
        data: formData,
      });
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex justify-center">
              <Avatar size="xl" className="w-16 h-16 p-4 rounded-xl">
                <span className="text-2xl font-bold">TS</span>
              </Avatar>
            </div>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-base-content/70 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <input
              type="hidden"
              name="redirectUrl"
              defaultValue={redirectUrl}
            />

            <button
              type="submit"
              className="btn btn-primary w-full mt-6 h-12"
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
            </button>

            {!!loginMutation.error && (
              <div className="alert alert-error mt-4">
                {renderError(loginMutation.error)}
              </div>
            )}

            <div className="divider text-base-content/70 text-sm">
              Don&apos;t have an account?
            </div>
            <Link
              to="/signup"
              search={{ redirectUrl }}
              className="btn btn-outline btn-block h-12 gap-2"
            >
              <UserPlus size={18} />
              Create account
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
