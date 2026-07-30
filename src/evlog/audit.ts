import { defineAuditAction } from "evlog";

export const AUTH_ACCESSED = defineAuditAction("auth.accessed", {
  target: "auth-endpoint",
  description: "Records a successful Better Auth read operation.",
});

export const AUTH_CREATED = defineAuditAction("auth.created", {
  target: "auth-endpoint",
  description: "Records a successful Better Auth mutation.",
});
