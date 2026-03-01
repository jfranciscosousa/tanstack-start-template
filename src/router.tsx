import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { NotFound } from "./components/not-found";
import { DefaultCatchBoundary } from "./components/default-catch-boundary";

export function getRouter() {
  const router = createTanStackRouter({
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    defaultPendingComponent: () => (
      <div className="h-screen w-screen" data-testid="loader">
        <span className="absolute top-1/2 left-1/2 translate-x-1/2 -translate-y-1/2 loading loading-spinner w-[64px]" />
      </div>
    ),
    defaultPendingMinMs: 750,
    defaultPendingMs: 500,
    defaultPreload: "viewport",
    routeTree,
    scrollRestoration: true,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
