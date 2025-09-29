import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ context, location }) => {
    let redirectUrl = `${location.pathname}`;

    if (location.searchStr) redirectUrl += `${location.searchStr}`;
console.log(context)
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
  const { user } = Route.useRouteContext();

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar user={user} />

      <main>
        <Outlet />
      </main>
    </div>
  );
}
