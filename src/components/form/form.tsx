// oxlint-disable typescript/no-explicit-any
import type { ZodType } from "zod";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import type { ReactFormExtendedApi } from "@tanstack/react-form";

import { isParamsError, renderError } from "~/errors";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Avatar } from "~/components/ui/avatar";
import { Alert, AlertDescription } from "~/components/ui/alert";

import { PasswordField } from "./password-field";

type FieldType = "text" | "email" | "password";
type AvatarVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "accent"
  | "muted"
  | "warning"
  | "info"
  | "success";

/**
 * Configuration for a single form field.
 *
 * @template TValues - The shape of the form values object. All values must be strings.
 *
 * @example
 * const emailField: FieldConfig<{ email: string }> = {
 *   name: "email",
 *   label: "Email Address",
 *   type: "email",
 *   placeholder: "you@example.com",
 *   required: true,
 * };
 *
 * @example Cross-field validation with `validate`:
 * const confirmField: FieldConfig<{ password: string; passwordConfirmation: string }> = {
 *   name: "passwordConfirmation",
 *   label: "Confirm Password",
 *   type: "password",
 *   validate: (value, values) => {
 *     if (values.password && value !== values.password) return "Passwords must match";
 *   },
 * };
 */
export interface FieldConfig<TValues extends Record<string, string>> {
  /** Key of the form values object this field is bound to. */
  name: keyof TValues & string;
  /** Human-readable label rendered above the input. */
  label: string;
  /**
   * Input type. Defaults to `"text"`.
   * - `"password"` renders a `PasswordField` with a show/hide toggle.
   */
  type?: FieldType;
  /** Placeholder text shown inside the input when empty. */
  placeholder?: string;
  /** Marks the field as required (native HTML attribute + ARIA). */
  required?: boolean;
  /**
   * Optional field-level validator that runs on submit.
   *
   * Use this for cross-field checks (e.g. password confirmation) where a
   * Zod schema `refine` would only surface the error at the form level.
   * Return an error message string to fail validation, or `undefined` to pass.
   *
   * Errors from this validator are shown inline beneath the field after the
   * first submission attempt, even if the field was never focused.
   */
  validate?: (value: string, formValues: TValues) => string | undefined;
}

/**
 * Groups one or more {@link FieldConfig} entries under an optional heading.
 *
 * When multiple groups are passed to `<Form>`, a `<Separator>` is rendered
 * between them and each group can display a titled section header with an
 * optional icon.
 *
 * @template TValues - The shape of the form values object.
 *
 * @example
 * const group: FormGroupConfig<MyValues> = {
 *   title: "Security",
 *   icon: Lock,
 *   iconVariant: "warning",
 *   fields: [currentPasswordField, newPasswordField],
 * };
 */
export interface FormGroupConfig<TValues extends Record<string, string>> {
  /** Section heading rendered above the group's fields. */
  title?: string;
  /** Lucide icon rendered in the section header avatar. */
  icon?: LucideIcon;
  /** Visual variant for the avatar that wraps the icon. */
  iconVariant?: AvatarVariant;
  /** Fields belonging to this group. */
  fields: FieldConfig<TValues>[];
}

/**
 * Props for the {@link Form} component.
 *
 * @template TValues - The shape of the form values object. All values must be strings.
 */
interface FormProps<TValues extends Record<string, string>> {
  /**
   * Zod schema used for full-form validation on submit.
   *
   * Validation errors surface in the form-level error alert. For field-level
   * inline errors (e.g. from cross-field `refine` rules) use
   * {@link FieldConfig.validate} instead.
   */

  schema: ZodType<TValues, any, any>;
  /** Initial values for every field. Must include a key for each field in `fields`. */
  defaultValues: TValues;
  /**
   * Field configuration. Accepts either:
   * - A flat `FieldConfig[]` for a single ungrouped form.
   * - A `FormGroupConfig[]` for a sectioned form with titled groups.
   */
  fields: FieldConfig<TValues>[] | FormGroupConfig<TValues>[];
  /** Called with the validated form values when the user submits. Must return a Promise. */
  onSubmit: (values: TValues) => Promise<void>;
  /** Renders the submit button area. Receives the full `formApi` instance. */

  renderSubmit: (
    form: ReactFormExtendedApi<
      TValues,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any
    >
  ) => React.ReactNode;
}

function isGroupConfig<TValues extends Record<string, string>>(
  fields: FieldConfig<TValues>[] | FormGroupConfig<TValues>[]
): fields is FormGroupConfig<TValues>[] {
  return fields.length > 0 && "fields" in fields[0];
}

/**
 * Generic, config-driven form component built on TanStack Form and Zod.
 *
 * Renders a list of fields (or sectioned groups of fields) described by plain
 * config objects. Handles controlled state, validation, error display, and
 * submit/cancel actions — no manual `useForm` wiring required at the call site.
 *
 * **Validation model**
 * - The Zod `schema` runs against the entire form on submit. Any errors are
 *   shown in a form-level destructive alert below the fields.
 * - Individual fields may also define a `validate` callback (see
 *   {@link FieldConfig.validate}) for inline, field-level error messages — the
 *   recommended approach for cross-field rules like password confirmation.
 * - Field errors are shown after a field is blurred **or** after the first
 *   submit attempt, whichever comes first.
 *
 * **Field types**
 * - `"text"` / `"email"` — renders a standard `<Input>`.
 * - `"password"` — renders a `<PasswordField>` with a show/hide toggle button.
 *
 * @template TValues - Shape of the form values. All leaf values must be strings.
 *
 * @example Flat fields
 * ```tsx
 * <Form
 *   schema={loginSchema}
 *   defaultValues={{ email: "", password: "" }}
 *   fields={[
 *     { name: "email", label: "Email", type: "email", required: true },
 *     { name: "password", label: "Password", type: "password", required: true },
 *   ]}
 *   submitLabel="Log in"
 *   onSubmit={async (values) => { await loginFn({ data: values }); }}
 * />
 * ```
 *
 * @example Grouped fields with icons
 * ```tsx
 * <Form
 *   schema={profileSchema}
 *   defaultValues={defaultProfileValues}
 *   fields={[
 *     {
 *       title: "Basic Information",
 *       icon: User,
 *       fields: [
 *         { name: "name", label: "Full Name", required: true },
 *         { name: "email", label: "Email", type: "email", required: true },
 *       ],
 *     },
 *     {
 *       title: "Change Password",
 *       icon: Lock,
 *       iconVariant: "warning",
 *       fields: [
 *         { name: "currentPassword", label: "Current Password", type: "password" },
 *         { name: "newPassword", label: "New Password", type: "password" },
 *         {
 *           name: "passwordConfirmation",
 *           label: "Confirm New Password",
 *           type: "password",
 *           validate: (value, values) =>
 *             values.newPassword && value !== values.newPassword
 *               ? "Passwords must match"
 *               : undefined,
 *         },
 *       ],
 *     },
 *   ]}
 *   submitLabel="Save Changes"
 *   onCancel={() => router.navigate({ to: "/" })}
 *   onSubmit={async (values) => { await updateProfileFn({ data: values }); }}
 * />
 * ```
 */
export function Form<TValues extends Record<string, string>>({
  schema,
  defaultValues,
  fields,
  onSubmit,
  renderSubmit,
}: FormProps<TValues>) {
  const groups: FormGroupConfig<TValues>[] = isGroupConfig(fields)
    ? fields
    : [{ fields }];
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Record<string, string[]>
  >({});
  const [serverError, setServerError] = useState<string>();

  function clearServerFieldError(name: string) {
    setServerFieldErrors(prev => {
      if (!prev[name]) return prev;
      const { [name]: _omit, ...rest } = prev;
      return rest;
    });
  }
  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
    onSubmitInvalid: () => {
      setServerFieldErrors({});
      setServerError(undefined);
    },
    onSubmit: async ({ value }) => {
      setServerFieldErrors({});
      setServerError(undefined);

      try {
        await onSubmit(value);
      } catch (error) {
        if (isParamsError(error)) {
          setServerFieldErrors(error.meta);
        } else {
          setServerError(renderError(error));
        }
      }
    },
  });

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        {groups.map((group, groupIndex) => (
          <div key={group.title ?? group.fields[0]?.name} className="space-y-4">
            {groupIndex > 0 && <Separator />}

            {group.title && (
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                {group.icon && (
                  <Avatar size="sm" variant={group.iconVariant}>
                    <group.icon size={18} />
                  </Avatar>
                )}
                {group.title}
              </h2>
            )}

            {group.fields.map(fieldConfig => (
              <form.Field
                key={fieldConfig.name}
                name={fieldConfig.name}
                validators={{
                  onDynamic: ({ value }) => {
                    if (!fieldConfig.validate) return;

                    return fieldConfig.validate(
                      value as string,
                      form.state.values
                    );
                  },
                }}
              >
                {field => {
                  const wasSubmitted = field.form.state.submissionAttempts > 0;
                  const tanstackInvalid =
                    (field.state.meta.isTouched || wasSubmitted) &&
                    !field.state.meta.isValid;
                  const fieldServerErrors =
                    serverFieldErrors[fieldConfig.name] ?? [];
                  const allErrors = [
                    ...(tanstackInvalid
                      ? field.state.meta.errors.filter(Boolean).map(err => ({
                          message:
                            typeof err === "string"
                              ? err
                              : ((err as { message?: string })?.message ??
                                String(err)),
                        }))
                      : []),
                    ...fieldServerErrors.map(msg => ({ message: msg })),
                  ];
                  const isInvalid = allErrors.length > 0;
                  const errors = isInvalid ? allErrors : undefined;

                  if (fieldConfig.type === "password") {
                    return (
                      <PasswordField
                        id={field.name}
                        name={field.name}
                        label={fieldConfig.label}
                        placeholder={fieldConfig.placeholder}
                        required={fieldConfig.required}
                        errors={errors}
                        value={field.state.value as any}
                        onChange={event => {
                          field.handleChange(event.target.value as any);
                          clearServerFieldError(fieldConfig.name);
                        }}
                        onBlur={field.handleBlur}
                      />
                    );
                  }

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor={field.name}>
                        {fieldConfig.label}
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type={fieldConfig.type ?? "text"}
                        value={field.state.value as string}
                        onBlur={field.handleBlur}
                        onChange={event => {
                          field.handleChange(event.target.value as any);
                          clearServerFieldError(fieldConfig.name);
                        }}
                        placeholder={fieldConfig.placeholder}
                        required={fieldConfig.required}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            ))}
          </div>
        ))}

        <form.Subscribe selector={state => state.errors}>
          {errors => {
            const hasFormErrors = errors.length > 0;

            return (
              <>
                {hasFormErrors && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      The form has some errors, please review them.
                    </AlertDescription>
                  </Alert>
                )}

                {serverError && (
                  <Alert variant="destructive">
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}
              </>
            );
          }}
        </form.Subscribe>

        {renderSubmit(form)}
      </FieldGroup>
    </form>
  );
}
