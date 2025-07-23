import { ReactNode } from "react";

interface AvatarProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 p-2",
  md: "w-10 h-10 p-2",
  lg: "w-12 h-12 p-3", 
  xl: "w-16 h-16 p-4",
};

const variantClasses = {
  primary: "bg-primary text-primary-content",
  secondary: "bg-secondary text-secondary-content", 
  accent: "bg-accent text-accent-content",
  info: "bg-info text-info-content",
  success: "bg-success text-success-content",
  warning: "bg-warning text-warning-content",
  error: "bg-error text-error-content",
};

export function Avatar({ 
  children, 
  size = "md", 
  variant = "primary", 
  className = "" 
}: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  
  return (
    <div className={`avatar ${variantClass} ${sizeClass} rounded-xl flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}