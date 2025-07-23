import { useServerFn } from "@tanstack/react-start";
import { Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "~/hooks/useMutation";
import { signupFn } from "~/server/users";
import { User, Mail, Lock, Eye, Loader2, DollarSign, LogIn } from "lucide-react";
import { Avatar } from "./Avatar";

export function SignUp() {
  const router = useRouter();
  const fn = useServerFn(signupFn);
  const signupMutation = useMutation({
    fn,
    onSuccess: async (ctx) => {
      await router.invalidate();
      router.navigate({ to: "/" });
      return;
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
            <div className="mx-auto mb-4 flex justify-center">
              <Avatar size="xl" className="w-16 h-16 p-4 rounded-xl">
                <span className="text-2xl font-bold">TS</span>
              </Avatar>
            </div>
            <h1 className="text-3xl font-bold">
              Welcome to TanStack Start
            </h1>
            <p className="text-base-content/70 mt-2">Create your account to get started</p>
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

            <button
              type="submit"
              className="btn btn-primary w-full mt-6 h-12"
              disabled={signupMutation.status === "pending"}
            >
              {signupMutation.status === "pending" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <User size={18} />
                  Create Account
                </>
              )}
            </button>

            {signupMutation.error && (
              <div className="alert alert-error mt-4">
                <span>{signupMutation.error.message}</span>
              </div>
            )}

            <div className="divider text-base-content/70 text-sm">
              Already have an account?
            </div>
            <Link to="/login" className="btn btn-outline btn-block h-12 gap-2">
              <LogIn size={18} />
              Sign In
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
