import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group";

export interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  icon?: LucideIcon;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  errors?: { message: string }[];
}

export function PasswordField({
  id,
  name,
  label,
  icon: Icon,
  placeholder,
  autoComplete,
  required,
  minLength,
  errors,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  function handleToggle() {
    setShowPassword((prev) => !prev);
  }

  return (
    <Field data-invalid={errors?.length ? true : undefined}>
      <FieldLabel htmlFor={id}>
        {Icon && <Icon size={14} className="text-muted-foreground" aria-hidden="true" />}
        {label}
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          aria-invalid={Boolean(errors?.length)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            onClick={handleToggle}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <FieldError errors={errors} />
    </Field>
  );
}
