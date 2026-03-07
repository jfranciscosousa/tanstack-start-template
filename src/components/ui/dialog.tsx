import type { ComponentPropsWithoutRef } from "react";
import { Dialog } from "@base-ui/react/dialog";

import { cn } from "~/lib/utils";

export const DialogRoot = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;
export const DialogClose = Dialog.Close;

export function DialogBackdrop({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Dialog.Backdrop>) {
  return (
    <Dialog.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Dialog.Popup>) {
  return (
    <Dialog.Portal>
      <DialogBackdrop />
      <Dialog.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow-xl transition-all duration-200 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
          className
        )}
        {...props}
      />
    </Dialog.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      className={cn("mt-2 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
