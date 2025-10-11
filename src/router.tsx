import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary";
import { NotFound } from "./components/NotFound";

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "viewport",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true,
    defaultPendingComponent: () => (
      <div className="h-screen w-screen" data-testid="loader">
        <span className="absolute top-1/2 left-1/2 translate-x-1/2 -translate-y-1/2 loading loading-spinner w-[64px]"></span>
      </div>
    ),
    defaultPendingMinMs: 750,
    defaultPendingMs: 500,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
