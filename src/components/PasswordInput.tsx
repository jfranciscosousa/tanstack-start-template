import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { type ComponentPropsWithoutRef, useState } from "react";

export interface PasswordInputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  label: string;
  icon?: LucideIcon;
  error?: string | string[];
}

export function PasswordInput({
  label,
  icon: Icon,
  error,
  className = "",
  ...inputProps
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const errorMessage = Array.isArray(error) ? error.join(", ") : error;

  return (
    <div className="form-control">
      {label && (
        <label className="label" htmlFor={inputProps.id}>
          <span className="label-text flex items-center gap-2">
            {Icon && <Icon size={16} />}
            {label}
          </span>
        </label>
      )}
      <div className="relative">
        <input
          {...inputProps}
          type={showPassword ? "text" : "password"}
          className={`input input-bordered w-full pr-12 ${errorMessage ? "input-error" : ""} ${className}`}
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm absolute right-2 top-1/2 transform -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errorMessage && (
        <label className="label">
          <span className="label-text-alt text-error">{errorMessage}</span>
        </label>
      )}
    </div>
  );
}
