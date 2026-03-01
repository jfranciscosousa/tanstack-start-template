import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_unauthed")({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: "/" });
    }
  },
  component: () => <Outlet />,
});
