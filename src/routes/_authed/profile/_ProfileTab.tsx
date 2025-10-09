import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { User, Mail, Lock, Save, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "~/components/Avatar";
import { PasswordInput } from "~/components/PasswordInput";
import { TextInput } from "~/components/TextInput";
import { useFormDataValidator } from "~/hooks/useFormDataValidator";
import { useMutation } from "~/hooks/useMutation";
import { useCurrentUser } from "~/routes/__root";
import { updateUserFn, updateUserSchema } from "~/server/users";
import { renderError } from "~/errors";

export function ProfileTab() {
  const user = useCurrentUser();
  const router = useRouter();
  const updateFn = useServerFn(updateUserFn);
  const validator = useFormDataValidator(updateUserSchema);

  const updateMutation = useMutation({
    fn: updateFn,
    onSuccess: async () => {
      await router.invalidate();
      toast("Profile updated successfully!");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    if (validator.validate(formData)) {
      updateMutation.mutate({
        data: formData,
      });
    }
  }

  return (
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

              <TextInput
                type="text"
                name="name"
                id="name"
                label="Full Name"
                icon={User}
                defaultValue={user?.name}
                placeholder="Enter your full name"
                error={validator.errors?.properties?.name?.errors}
                required
              />

              <TextInput
                type="email"
                name="email"
                id="email"
                label="Email Address"
                icon={Mail}
                defaultValue={user?.email}
                placeholder="Enter your email"
                error={validator.errors?.properties?.email?.errors}
                required
              />
            </div>

            <div className="divider">Security</div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Avatar size="sm" variant="warning">
                  <Lock size={18} />
                </Avatar>
                Change Password
              </h2>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="label-text flex items-center gap-2">
                    <Lock size={16} />
                    Current Password
                  </span>
                  <span className="label-text-alt text-error">Required</span>
                </div>
                <PasswordInput
                  name="currentPassword"
                  id="currentPassword"
                  label=""
                  placeholder="Enter your current password"
                  error={validator.errors?.properties?.currentPassword?.errors}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="label-text flex items-center gap-2">
                    <Lock size={16} />
                    New Password
                  </span>
                  <span className="label-text-alt text-base-content/60">
                    Optional
                  </span>
                </div>
                <PasswordInput
                  name="password"
                  id="password"
                  label=""
                  placeholder="Enter new password (leave blank to keep current)"
                  error={validator.errors?.properties?.password?.errors}
                  minLength={6}
                />
              </div>

              <PasswordInput
                name="passwordConfirmation"
                id="passwordConfirmation"
                label="Confirm New Password"
                icon={Eye}
                placeholder="Confirm your new password"
                error={
                  validator.errors?.properties?.passwordConfirmation?.errors
                }
                minLength={6}
              />
            </div>

            {!!updateMutation.error && (
              <div className="alert alert-error">
                <span>{renderError(updateMutation.error)}</span>
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
    </>
  );
}
