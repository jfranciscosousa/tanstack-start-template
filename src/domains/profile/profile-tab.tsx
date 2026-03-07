import { toast } from "sonner";
import { CalendarDays, Clock, Lock, User } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";

import { updateUserFn } from "~/server/handlers/user-handlers";
import { updateUserSchema } from "~/schemas/user-schemas";
import { useCurrentUser } from "~/routes/__root";
import { Form } from "~/components/form/form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

export function ProfileTab() {
  const user = useCurrentUser();
  const router = useRouter();
  const updateFn = useServerFn(updateUserFn);

  return (
    <>
      <Card className="shadow-xl">
        <CardContent>
          <Form
            schema={updateUserSchema}
            defaultValues={{
              name: user?.name ?? "",
              email: user?.email ?? "",
              currentPassword: "",
              password: "",
              passwordConfirmation: "",
            }}
            fields={[
              {
                title: "Basic Information",
                icon: User,
                fields: [
                  {
                    name: "name",
                    label: "Full Name",
                    type: "text",
                    placeholder: "Enter your full name",
                    required: true,
                  },
                  {
                    name: "email",
                    label: "Email Address",
                    type: "email",
                    placeholder: "Enter your email",
                    required: true,
                  },
                ],
              },
              {
                title: "Change Password",
                icon: Lock,
                iconVariant: "warning",
                fields: [
                  {
                    name: "currentPassword",
                    label: "Current Password",
                    type: "password",
                    placeholder: "Enter your current password",
                    required: true,
                  },
                  {
                    name: "password",
                    label: "New Password",
                    type: "password",
                    placeholder:
                      "Enter new password (leave blank to keep current)",
                  },
                  {
                    name: "passwordConfirmation",
                    label: "Confirm New Password",
                    type: "password",
                    placeholder: "Confirm your new password",
                    validate: (value, values) => {
                      if (values.password && value !== values.password) {
                        return "Passwords must match";
                      }
                    },
                  },
                ],
              },
            ]}
            onSubmit={async (value) => {
              await updateFn({ data: value });
              await router.invalidate();
              toast("Profile updated successfully!");
            }}
            renderSubmit={(form) => (
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void router.navigate({ to: "/" })}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </form.Subscribe>
            )}
          />
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="shadow-xl mt-4">
        <CardContent>
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
