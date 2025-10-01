import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  User,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar } from "~/components/Avatar";
import { useMutation } from "~/hooks/useMutation";
import { useCurrentUser } from "~/routes/__root";
import { updateUserFn } from "~/server/users";
import { fetchUserSessions, revokeSession } from "~/server/sessions";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfileComponent,
  loader: async () => {
    const sessions = await fetchUserSessions();
    return sessions;
  },
});

function ProfileComponent() {
  const user = useCurrentUser();
  const router = useRouter();
  const { sessions, currentSessionId } = Route.useLoaderData();
  const updateFn = useServerFn(updateUserFn);
  const revokeFn = useServerFn(revokeSession);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "sessions">("profile");

  const updateMutation = useMutation({
    fn: updateFn,
    onSuccess: async () => {
      await router.invalidate();
      toast("Profile updated successfully!");
    },
  });

  const revokeMutation = useMutation({
    fn: revokeFn,
    onSuccess: async () => {
      await router.invalidate();
      toast("Session revoked successfully!");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    updateMutation.mutate({
      data: new FormData(e.target as HTMLFormElement),
    });
  }

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return Monitor;
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone"))
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Avatar size="xl" className="w-20 h-20 p-6 rounded-2xl">
              <span className="text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </Avatar>
          </div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-base-content/70 mt-2">
            Manage your account information, password, and active sessions
          </p>
        </div>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-boxed bg-base-100 shadow">
          <button
            role="tab"
            className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={16} className="mr-2" />
            Profile
          </button>
          <button
            role="tab"
            className={`tab ${activeTab === "sessions" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("sessions")}
          >
            <Shield size={16} className="mr-2" />
            Sessions ({sessions.length})
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <>
            {/* Profile Form */}
            <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Avatar size="sm">
                    <User size={18} />
                  </Avatar>
                  Basic Information
                </h2>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <User size={16} />
                      Full Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={user?.name}
                    placeholder="Enter your full name"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Mail size={16} />
                      Email Address
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={user?.email}
                    placeholder="Enter your email"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
              </div>

              <div className="divider">Security</div>

              {/* Password Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Avatar size="sm" variant="warning">
                    <Lock size={18} />
                  </Avatar>
                  Change Password
                </h2>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Lock size={16} />
                      Current Password
                    </span>
                    <span className="label-text-alt text-error">Required</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      placeholder="Enter your current password"
                      className="input input-bordered w-full pr-12"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Lock size={16} />
                      New Password
                    </span>
                    <span className="label-text-alt text-base-content/60">
                      Optional
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter new password (leave blank to keep current)"
                      className="input input-bordered w-full pr-12"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Eye size={16} />
                      Confirm New Password
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="passwordConfirmation"
                      placeholder="Confirm your new password"
                      className="input input-bordered w-full pr-12"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {updateMutation.error && (
                <div className="alert alert-error">
                  <span>{updateMutation.error.message}</span>
                </div>
              )}

              {/* Actions */}
              <div className="card-actions justify-end pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => router.navigate({ to: "/" })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary gap-2"
                  disabled={updateMutation.status === "pending"}
                >
                  {updateMutation.status === "pending" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

            {/* Account Info */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">
                  Account Information
                </h2>
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-title">Member Since</div>
                    <div className="stat-value text-sm">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Last Updated</div>
                    <div className="stat-value text-sm">
                      {user?.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                <Avatar size="sm" variant="info">
                  <Shield size={18} />
                </Avatar>
                Active Sessions
              </h2>
              <p className="text-base-content/70 mb-6">
                Manage your active sessions across different devices. You can
                revoke access from any device except your current one.
              </p>

              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-base-content/70">No active sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => {
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
                                variant={
                                  isCurrentSession ? "primary" : "secondary"
                                }
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

                            <div className="flex-shrink-0">
                              {!isCurrentSession && (
                                <button
                                  className="btn btn-error btn-sm"
                                  onClick={() =>
                                    revokeMutation.mutate({ data: session.id })
                                  }
                                  disabled={
                                    revokeMutation.status === "pending"
                                  }
                                >
                                  {revokeMutation.status === "pending" ? (
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />
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

              {revokeMutation.error && (
                <div className="alert alert-error mt-4">
                  <span>{revokeMutation.error.message}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
