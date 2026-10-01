import { toast } from "sonner";
import { CalendarDays, Clock, Lock, User } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";

import { updateUserFn } from "~/server/handlers/user-handlers";
import { updateUserSchema } from "~/schemas/user-schemas";
import { useCurrentUser } from "~/routes/__root";
import { formatDate } from "~/lib/date";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/form/form";

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
            onSubmit={async value => {
              await updateFn({ data: value });
              await router.invalidate();
              toast("Profile updated successfully!");
            }}
            renderSubmit={form => (
              <form.Subscribe selector={state => state.isSubmitting}>
                {isSubmitting => (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
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

      <Card className="mt-4 shadow-xl">
        <CardContent>
          <Item size="xs" className="mb-4 p-0">
            <ItemContent>
              <ItemTitle>
                <h2 className="text-lg font-semibold">Account Information</h2>
              </ItemTitle>
            </ItemContent>
          </Item>
          <ItemGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Item render={<li />} variant="outline">
              <ItemMedia variant="icon">
                <CalendarDays aria-hidden="true" />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Member Since</ItemDescription>
                <ItemTitle>
                  {formatDate(user?.createdAt, "long-date")}
                </ItemTitle>
              </ItemContent>
            </Item>
            <Item render={<li />} variant="outline">
              <ItemMedia variant="icon">
                <Clock aria-hidden="true" />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Last Updated</ItemDescription>
                <ItemTitle>
                  {formatDate(user?.updatedAt, "long-date")}
                </ItemTitle>
              </ItemContent>
            </Item>
          </ItemGroup>
        </CardContent>
      </Card>
    </>
  );
}
