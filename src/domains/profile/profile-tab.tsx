import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  Eye,
  Loader2,
  Lock,
  Mail,
  Save,
  User,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";

import {
  updateUserFn,
  updateUserSchema,
} from "~/server/handlers/user-handlers";
import { useCurrentUser } from "~/routes/__root";
import { useMutation } from "~/hooks/use-mutation";
import { useFormDataValidator } from "~/hooks/use-form-data-validator";
import { renderError } from "~/errors";
import { PasswordField } from "~/components/password-field";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";

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

  function handleCancel() {
    void router.navigate({ to: "/" });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (validator.validate(formData)) {
      updateMutation.mutate({
        data: formData,
      });
    }
  }

  return (
    <>
      {/* Profile Form */}
      <Card className="shadow-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Avatar size="sm">
                  <User size={18} />
                </Avatar>
                Basic Information
              </h2>

              <Field
                data-invalid={
                  Boolean(validator.errors?.name?.length) || undefined
                }
              >
                <FieldLabel htmlFor="name">
                  <User size={14} className="text-muted-foreground" />
                  Full Name
                </FieldLabel>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  defaultValue={user?.name}
                  placeholder="Enter your full name"
                  aria-invalid={Boolean(validator.errors?.name?.length)}
                  required
                />
                <FieldError errors={validator.errors?.name} />
              </Field>

              <Field
                data-invalid={
                  Boolean(validator.errors?.email?.length) || undefined
                }
              >
                <FieldLabel htmlFor="email">
                  <Mail size={14} className="text-muted-foreground" />
                  Email Address
                </FieldLabel>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={user?.email}
                  placeholder="Enter your email"
                  aria-invalid={Boolean(validator.errors?.email?.length)}
                  required
                />
                <FieldError errors={validator.errors?.email} />
              </Field>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Avatar size="sm" variant="warning">
                  <Lock size={18} />
                </Avatar>
                Change Password
              </h2>

              <PasswordField
                id="currentPassword"
                name="currentPassword"
                label="Current Password"
                icon={Lock}
                placeholder="Enter your current password"
                errors={validator.errors?.currentPassword}
                required
              />

              <PasswordField
                id="password"
                name="password"
                label="New Password"
                icon={Lock}
                placeholder="Enter new password (leave blank to keep current)"
                errors={validator.errors?.password}
                minLength={6}
              />

              <PasswordField
                id="passwordConfirmation"
                name="passwordConfirmation"
                label="Confirm New Password"
                icon={Eye}
                placeholder="Confirm your new password"
                errors={validator.errors?.passwordConfirmation}
                minLength={6}
              />
            </div>

            {Boolean(updateMutation.error) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {renderError(updateMutation.error)}
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
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
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="shadow-xl mt-4">
        <CardContent className="p-6">
          <CardTitle className="mb-4 text-lg">Account Information</CardTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
              <div className="rounded-md bg-background p-2">
                <CalendarDays size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-semibold">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
              <div className="rounded-md bg-background p-2">
                <Clock size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-semibold">
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
