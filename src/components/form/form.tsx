// oxlint-disable typescript/no-explicit-any
import { useState } from "react";
import { revalidateLogic, useForm } from "@tanstack/react-form";

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

import type { FormProps, FormGroupConfig, FieldConfig } from "./types";

import { PasswordField } from "./password-field";

function isGroupConfig<TValues extends Record<string, string>>(
  fields: FieldConfig<TValues>[] | FormGroupConfig<TValues>[]
): fields is FormGroupConfig<TValues>[] {
  return fields.length > 0 && "fields" in fields[0];
}

export type { FormGroupConfig, FieldConfig };

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
