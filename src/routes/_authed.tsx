import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";
import { useCurrentUser } from "./__root";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context, location }) => {
    let redirectUrl = `${location.pathname}`;

    if (location.searchStr) redirectUrl += `${location.searchStr}`;

    if (!context.user) {
      throw redirect({
        to: "/login",
        search: { redirectUrl },
      });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const user = useCurrentUser();

  return (
    <div
      className="min-h-screen bg-base-200"
      data-testid={`Welcome ${user.name}`}
    >
      <Navbar user={user} />

      <main>
        <Outlet />
      </main>
    </div>
  );
}
