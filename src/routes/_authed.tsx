import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { Navbar } from "~/components/navbar";

import { useCurrentUser } from "./__root";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context, location }) => {
    let redirectUrl = `${location.pathname}`;

    if (location.searchStr) {
      redirectUrl += `${location.searchStr}`;
    }

    if (!context.user) {
      throw redirect({
        search: { redirectUrl },
        to: "/login",
      });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const user = useCurrentUser();

  return (
    <div
      className="min-h-screen"
      data-testid={`Welcome ${user.name}`}
    >
      <Navbar user={user} />

      <main id="main" className="py-6">
        <Outlet />
      </main>
    </div>
  );
}
