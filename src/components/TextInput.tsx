import { type LucideIcon } from "lucide-react";
import { type ComponentPropsWithoutRef } from "react";

export interface TextInputProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  icon?: LucideIcon;
  error?: string | string[];
}

export function TextInput({
  label,
  icon: Icon,
  error,
  className = "",
  ...inputProps
}: TextInputProps) {
  const errorMessage = Array.isArray(error) ? error.join(", ") : error;

  return (
    <div className="form-control">
      <label className="label" htmlFor={inputProps.id}>
        <span className="label-text flex items-center gap-2">
          {Icon && <Icon size={16} />}
          {label}
        </span>
      </label>
      <input
        {...inputProps}
        className={`input input-bordered w-full ${errorMessage ? "input-error" : ""} ${className}`}
      />
      {errorMessage && (
        <label className="label">
          <span className="label-text-alt text-error">{errorMessage}</span>
        </label>
      )}
    </div>
  );
}