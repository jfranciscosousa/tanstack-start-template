import { toast } from "sonner";
import { Loader2, Monitor, Shield, Smartphone, Tablet } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";

import type { SessionView } from "~/server/handlers/session-handlers";

import { revokeSession } from "~/server/handlers/session-handlers";
import { formatDate } from "~/lib/date";
import { useMutation } from "~/hooks/use-mutation";
import { renderError } from "~/errors";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface SessionsTabProps {
  sessions: SessionView[];
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

function DeviceIcon({ userAgent }: { userAgent: string | null | undefined }) {
  if (!userAgent) {
    return <Monitor aria-hidden="true" />;
  }
  const ua = userAgent.toLowerCase();
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return <Smartphone aria-hidden="true" />;
  }
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return <Tablet aria-hidden="true" />;
  }
  return <Monitor aria-hidden="true" />;
}

interface SessionItemProps {
  session: SessionsTabProps["sessions"][number];
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
}

function SessionItem({ session, onRevoke, isRevoking }: SessionItemProps) {
  function handleRevoke() {
    onRevoke(session.id);
  }

  return (
    <Item render={<li />} variant="outline">
      <ItemMedia variant="icon">
        <DeviceIcon userAgent={session.userAgent} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <h3 className="font-semibold">{getDeviceName(session.userAgent)}</h3>
          {session.isCurrent && <Badge variant="secondary">Current</Badge>}
        </ItemTitle>
        {session.ipAddress && (
          <ItemDescription>{session.ipAddress}</ItemDescription>
        )}
        <ItemDescription>
          Last active: {formatDate(session.updatedAt, "date-time")}
        </ItemDescription>
      </ItemContent>
      {!session.isCurrent && (
        <ItemActions className="max-sm:basis-full max-sm:justify-end">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRevoke}
            disabled={isRevoking}
            aria-label={`Revoke ${getDeviceName(session.userAgent)} session`}
          >
            {isRevoking && (
              <Loader2 aria-hidden="true" size={16} className="animate-spin" />
            )}
            {isRevoking ? "Revoking..." : "Revoke"}
          </Button>
        </ItemActions>
      )}
    </Item>
  );
}

export function SessionsTab({ sessions }: SessionsTabProps) {
  const router = useRouter();
  const revokeFn = useServerFn(revokeSession);

  const revokeMutation = useMutation({
    fn: revokeFn,
    onSuccess: async () => {
      await router.invalidate();
      toast("Session revoked successfully!");
    },
  });

  function handleRevoke(sessionId: string) {
    revokeMutation.mutate({ data: sessionId });
  }

  return (
    <Card className="shadow-xl">
      <CardContent>
        <Item size="xs" className="mb-4 p-0">
          <ItemMedia variant="icon">
            <Shield aria-hidden="true" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              <h2 className="text-lg font-semibold">Active Sessions</h2>
            </ItemTitle>
            <ItemDescription className="group-data-[size=xs]/item:text-sm">
              Manage your active sessions across different devices. You can
              revoke access from any device except your current one.
            </ItemDescription>
          </ItemContent>
        </Item>

        {sessions.length === 0 ? (
          <Item variant="muted">
            <ItemContent>
              <ItemDescription>No active sessions</ItemDescription>
            </ItemContent>
          </Item>
        ) : (
          <ItemGroup>
            {sessions.map(session => (
              <SessionItem
                key={session.id}
                session={session}
                onRevoke={handleRevoke}
                isRevoking={revokeMutation.status === "pending"}
              />
            ))}
          </ItemGroup>
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
