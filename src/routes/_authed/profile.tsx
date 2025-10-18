import { createFileRoute } from "@tanstack/react-router";
import { Shield, User } from "lucide-react";
import { useState } from "react";
import { Avatar } from "~/components/Avatar";
import { useCurrentUser } from "~/routes/__root";
import { fetchUserSessions } from "~/server/sessions";
import { ProfileTab } from "./profile/-ProfileTab";
import { SessionsTab } from "./profile/-SessionsTab";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfileComponent,
  loader: async () => {
    const sessions = await fetchUserSessions();
    return sessions;
  },
});

function ProfileComponent() {
  const user = useCurrentUser();
  const { sessions, currentSessionId } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<"profile" | "sessions">("profile");

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
        {activeTab === "profile" && <ProfileTab />}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <SessionsTab
            sessions={sessions}
            currentSessionId={currentSessionId}
          />
        )}
      </div>
    </div>
  );
}
