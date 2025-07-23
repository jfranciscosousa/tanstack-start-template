import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "../hooks/useMutation";
import { Auth } from "./Auth";
import { loginFn } from "~/server/sessions";

export function Login() {
  const router = useRouter();
  const fn = useServerFn(loginFn);
  const loginMutation = useMutation({
    fn,
    onSuccess: async (ctx) => {
      await router.invalidate();
      router.navigate({ to: "/" });
    },
  });

  return (
    <Auth
      actionText="Sign In"
      status={loginMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement);

        loginMutation.mutate({
          data: formData,
        });
      }}
      afterSubmit={
        <>
          {loginMutation.error && (
            <div className="alert alert-error mt-4">
              <span>{loginMutation.error.message}</span>
            </div>
          )}

          <div className="divider text-base-content/70">
            Don't have an account?
          </div>
          <Link to="/signup" className="btn btn-outline btn-block">
            Create Account
          </Link>
        </>
      }
    />
  );
}
