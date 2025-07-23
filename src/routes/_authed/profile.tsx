import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { User, Mail, Lock, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar } from "~/components/Avatar";
import { useMutation } from "~/hooks/useMutation";
import { useCurrentUser } from "~/routes/__root";
import { updateUserFn } from "~/server/users";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfileComponent,
});

function ProfileComponent() {
  const user = useCurrentUser();
  const router = useRouter();
  const fn = useServerFn(updateUserFn);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateMutation = useMutation({
    fn,
    onSuccess: async () => {
      await router.invalidate();
      toast("Profile updated successfully!");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    updateMutation.mutate({
      data: new FormData(e.target as HTMLFormElement),
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
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
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-base-content/70 mt-2">
            Update your account information and password
          </p>
        </div>

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
            <h2 className="card-title text-lg mb-4">Account Information</h2>
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
      </div>
    </div>
  );
}
