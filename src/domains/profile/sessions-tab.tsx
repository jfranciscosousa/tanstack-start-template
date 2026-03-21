import { toast } from "sonner";
import {
  Clock,
  Loader2,
  Monitor,
  Shield,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";

import { revokeSession } from "~/server/handlers/session-handlers";
import { cn } from "~/lib/utils";
import { useMutation } from "~/hooks/use-mutation";
import { renderError } from "~/errors";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar } from "~/components/ui/avatar";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface SessionsTabProps {
  sessions: {
    id: string;
    token: string;
    userId: string;
    userAgent?: string | null | undefined;
    ipAddress?: string | null | undefined;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
  }[];
  currentSessionToken: string | undefined;
}

function getDeviceName(userAgent: string | null | undefined) {
  if (!userAgent) {
    return "Desktop";
  }
  if (
    userAgent.includes("Mobile") ||
    userAgent.includes("Android") ||
    userAgent.includes("iPhone")
  ) {
    return "Mobile Device";
  }
  if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
    return "Tablet";
  }
  return "Desktop";
}

function getDeviceIcon(userAgent: string | null | undefined) {
  if (!userAgent) {
    return Monitor;
  }
  const ua = userAgent.toLowerCase();
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return Smartphone;
  }
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return Tablet;
  }
  return Monitor;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

interface SessionCardProps {
  session: SessionsTabProps["sessions"][number];
  isCurrentSession: boolean;
  onRevoke: (token: string) => void;
  isRevoking: boolean;
}

function SessionCard({
  session,
  isCurrentSession,
  onRevoke,
  isRevoking,
}: SessionCardProps) {
  const DeviceIcon = getDeviceIcon(session.userAgent);

  function handleRevoke() {
    onRevoke(session.token);
  }

  return (
    <Card className={cn(isCurrentSession && "ring-2 ring-primary")}>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-4">
            <Avatar
              size="lg"
              variant={isCurrentSession ? "default" : "secondary"}
            >
              <DeviceIcon size={24} />
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold">
                  {getDeviceName(session.userAgent)}
                </h3>
                {isCurrentSession && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                {session.ipAddress && (
                  <div className="flex items-center gap-2">
                    <Monitor size={14} />
                    <span>{session.ipAddress}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>Last active: {formatDate(session.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {!isCurrentSession && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRevoke}
                disabled={isRevoking}
              >
                {isRevoking ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Revoke"
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionsTab({
  sessions,
  currentSessionToken,
}: SessionsTabProps) {
  const router = useRouter();
  const revokeFn = useServerFn(revokeSession);

  const revokeMutation = useMutation({
    fn: revokeFn,
    onSuccess: async () => {
      await router.invalidate();
      toast("Session revoked successfully!");
    },
  });

  function handleRevoke(token: string) {
    revokeMutation.mutate({ data: token });
  }

  return (
    <Card className="shadow-xl">
      <CardContent>
        <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
          <Avatar size="sm" variant="info">
            <Shield size={18} />
          </Avatar>
          Active Sessions
        </h2>
        <p className="mb-6 text-muted-foreground">
          Manage your active sessions across different devices. You can revoke
          access from any device except your current one.
        </p>

        {sessions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No active sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                isCurrentSession={session.token === currentSessionToken}
                onRevoke={handleRevoke}
                isRevoking={revokeMutation.status === "pending"}
              />
            ))}
          </div>
        )}

        {Boolean(revokeMutation.error) && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              {renderError(revokeMutation.error)}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
