import { Shield, User } from "lucide-react";

import { Route } from "~/routes/_authed/profile";
import { SessionsTab } from "~/domains/profile/sessions-tab";
import { ProfileTab } from "~/domains/profile/profile-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function ProfilePage() {
  const { sessions, currentSessionToken } = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account information, password, and active sessions
          </p>
        </div>

        <Tabs defaultValue="profile" className="flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1">
              <User size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex-1">
              <Shield size={16} />
              Sessions ({sessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="sessions" className="mt-6">
            <SessionsTab
              sessions={sessions}
              currentSessionToken={currentSessionToken}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
