import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Eye, Loader2, Lock, Mail, User } from "lucide-react";
import z from "zod";
import { renderError } from "~/errors";
import { useMutation } from "~/hooks/useMutation";
import { signupFn } from "~/server/users";

const searchSchema = z.object({
  redirectUrl: z.string().optional(),
});

export const Route = createFileRoute("/signup")({
  validateSearch: (search) => searchSchema.parse(search),
  component: SignUp,
});

function SignUp() {
  const { redirectUrl } = Route.useSearch();
  const router = useRouter();
  const fn = useServerFn(signupFn);
  const signupMutation = useMutation({
    fn,
    onSuccess: async () => {
      await router.invalidate();
      router.navigate({ to: "/" });
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    signupMutation.mutate({
      data: new FormData(e.target as HTMLFormElement),
    });
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
              Tanstack Start Sqlite
            </h1>
            <p className="text-base-content/70 mt-2">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <User size={16} />
                  Name
                </span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your full name"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </span>
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Create a password"
                className="input input-bordered w-full"
                required
                minLength={6}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Eye size={16} />
                  Confirm Password
                </span>
              </label>
              <input
                type="password"
                name="passwordConfirmation"
                id="passwordConfirmation"
                placeholder="Confirm your password"
                className="input input-bordered w-full"
                required
                minLength={6}
              />
            </div>

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
                "Create Account"
              )}
            </button>

            {signupMutation.error && (
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
              Sign In
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
