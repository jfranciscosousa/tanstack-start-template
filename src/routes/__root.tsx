import { Toaster } from "sonner";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

import { fetchCurrentUser } from "~/server/websession";
import { seo } from "~/server/seo.js";
import { AppError } from "~/errors";
import { NotFound } from "~/components/NotFound.js";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.js";

import appCss from "~/styles/app.css?url";

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
        title: "Tanstack start drizzle template",
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
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        {/* Reads localStorage before first paint to prevent theme flash */}
        <script
          // oxlint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.remove('dark');else if(t==='dark')document.documentElement.classList.add('dark');}())`,
          }}
        />
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
