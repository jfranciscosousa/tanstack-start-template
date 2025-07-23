import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/")({
  component: RouteComponent,
});

function RouteComponent() {
  return "Hello world! This is the authed route.";
}
