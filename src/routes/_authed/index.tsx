import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "~/routes/__root";
import { CheckSquare, Users, Clock, TrendingUp } from "lucide-react";
import { Avatar } from "~/components/Avatar";

export const Route = createFileRoute("/_authed/")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useCurrentUser();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="hero bg-base-300 rounded-2xl">
        <div className="hero-content text-center py-12">
          <div className="max-w-md">
            <div className="mx-auto mb-6 flex justify-center">
              <Avatar size="xl" className="w-20 h-20 p-6 rounded-xl">
                <span className="text-3xl font-bold">TS</span>
              </Avatar>
            </div>
            <h1 className="text-4xl font-bold">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="py-4 text-base-content/70">
              You're successfully signed in to your TanStack Start application.
              Your authentication is working perfectly.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <Avatar size="lg">
                <CheckSquare size={24} />
              </Avatar>
              <h2 className="card-title text-lg">Todo Management</h2>
            </div>
            <p className="text-base-content/70 mb-4">
              Organize your tasks and boost your productivity with our upcoming
              todo feature.
            </p>
            <div className="card-actions justify-end">
              <div className="badge badge-primary badge-outline">
                Coming Soon
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <Avatar size="lg" variant="secondary">
                <Users size={24} />
              </Avatar>
              <h2 className="card-title text-lg">User Management</h2>
            </div>
            <p className="text-base-content/70 mb-4">
              Secure authentication system with session management built with
              TanStack Start.
            </p>
            <div className="card-actions justify-end">
              <div className="badge badge-success">Active</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <Avatar size="lg" variant="accent">
                <TrendingUp size={24} />
              </Avatar>
              <h2 className="card-title text-lg">Analytics</h2>
            </div>
            <p className="text-base-content/70 mb-4">
              Track your progress and get insights into your productivity
              patterns.
            </p>
            <div className="card-actions justify-end">
              <div className="badge badge-primary badge-outline">Planned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4 flex items-center gap-2">
            <Avatar size="sm" variant="info">
              <Clock size={18} />
            </Avatar>
            Account Information
          </h2>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Name</div>
              <div className="stat-value text-lg">{user?.name}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Email</div>
              <div className="stat-value text-lg">{user?.email}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
