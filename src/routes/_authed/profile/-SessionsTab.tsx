import type { Session } from "~/server/db/schema";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Clock,
  Loader2,
  MapPin,
  Monitor,
  Shield,
  Smartphone,
  Tablet,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "~/components/Avatar";
import { renderError } from "~/errors";
import { useMutation } from "~/hooks/useMutation";
import { revokeSession } from "~/server/handlers/sessionHandlers";

interface SessionsTabProps {
  sessions: Session[];
  currentSessionId: string | undefined;
}

export function SessionsTab({ sessions, currentSessionId }: SessionsTabProps) {
  const router = useRouter();
  const revokeFn = useServerFn(revokeSession);

  const revokeMutation = useMutation({
    fn: revokeFn,
    onSuccess: async () => {
      await router.invalidate();
      toast("Session revoked successfully!");
    },
  });

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return Monitor;
    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    )
      return Smartphone;
    if (ua.includes("tablet") || ua.includes("ipad")) return Tablet;
    return Monitor;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4 flex items-center gap-2">
          <Avatar size="sm" variant="info">
            <Shield size={18} />
          </Avatar>
          Active Sessions
        </h2>
        <p className="text-base-content/70 mb-6">
          Manage your active sessions across different devices. You can revoke
          access from any device except your current one.
        </p>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-base-content/70">No active sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => {
              const DeviceIcon = getDeviceIcon(session.userAgent);
              const isCurrentSession = session.id === currentSessionId;

              return (
                <div
                  key={session.id}
                  className={`card bg-base-200 ${
                    isCurrentSession ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar
                          size="lg"
                          variant={isCurrentSession ? "primary" : "secondary"}
                        >
                          <DeviceIcon size={24} />
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {session.userAgent?.includes("Mobile") ||
                              session.userAgent?.includes("Android") ||
                              session.userAgent?.includes("iPhone")
                                ? "Mobile Device"
                                : session.userAgent?.includes("Tablet") ||
                                    session.userAgent?.includes("iPad")
                                  ? "Tablet"
                                  : "Desktop"}
                            </h3>
                            {isCurrentSession && (
                              <span className="badge badge-primary badge-sm">
                                Current
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-base-content/70">
                            {session.location && (
                              <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                <span className="truncate">
                                  {session.location}
                                </span>
                              </div>
                            )}
                            {session.ipAddress && (
                              <div className="flex items-center gap-2">
                                <Monitor size={14} />
                                <span>{session.ipAddress}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span>
                                Last active: {formatDate(session.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {!isCurrentSession && (
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() =>
                              revokeMutation.mutate({ data: session.id })
                            }
                            disabled={revokeMutation.status === "pending"}
                          >
                            {revokeMutation.status === "pending" ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              "Revoke"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!!revokeMutation.error && (
          <div className="alert alert-error mt-4">
            <span>{renderError(revokeMutation.error)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
