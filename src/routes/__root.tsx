import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Toaster } from "sonner";

import { DefaultCatchBoundary } from "~/components/default-catch-boundary.js";
import { NotFound } from "~/components/not-found.js";
import { AppError } from "~/errors";
import { auth } from "~/lib/auth";
import type { User } from "~/server/db/schema";
import { seo } from "~/server/seo.js";

import appCss from "~/styles/app.css?url";

const fetchCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const req = getRequest();
  const session = await auth.api.getSession({ headers: req.headers });
  return (session?.user as User) ?? null;
});

export const Route = createRootRoute({
  beforeLoad: async () => ({
    user: await fetchCurrentUser(),
  }),
  component: RootComponent,
  errorComponent: (props) => (
    <RootDocument>
      <DefaultCatchBoundary {...props} />
    </RootDocument>
  ),
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      {
        href: "/apple-touch-icon.png",
        rel: "apple-touch-icon",
        sizes: "180x180",
      },
      {
        href: "/favicon-32x32.png",
        rel: "icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        href: "/favicon-16x16.png",
        rel: "icon",
        sizes: "16x16",
        type: "image/png",
      },
      { color: "#fffff", href: "/site.webmanifest", rel: "manifest" },
      { href: "/favicon.ico", rel: "icon" },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      ...seo({
        description: "TODO",
        title: "my-tanstack-starter",
      }),
    ],
  }),
  loader: (ctx) => ({
    user: ctx.context.user,
  }),
  notFoundComponent: () => <NotFound />,
  ssr: true,
});

export function useCurrentUser() {
  const user = Route.useLoaderData()?.user;

  if (!user) {
    throw new AppError("NOT_FOUND");
  }

  return user;
}

function RootComponent() {
  const { user } = Route.useLoaderData();
  const theme = (user?.theme ?? "dark") as "dark" | "light";

  return (
    <RootDocument theme={theme}>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({
  children,
  theme = "dark",
}: {
  children: React.ReactNode;
  theme?: "dark" | "light";
}) {
  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""}>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-md"
        >
          Skip to main content
        </a>
        <Toaster />

        {children}

        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
