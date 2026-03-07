import { toast } from "sonner";
import { useCallback } from "react";
import { LogOut, Moon, Settings, Sun } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";

import { updateThemeFn } from "~/server/handlers/user-handlers";
import { useTheme } from "~/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";

const profileLink = (
  <Link to="/profile" className="flex w-full items-center gap-2">
    <Settings size={14} aria-hidden="true" />
    Edit Profile
  </Link>
);

const signOutLink = (
  <Link to="/logout" className="flex w-full items-center gap-2">
    <LogOut size={14} aria-hidden="true" />
    Sign out
  </Link>
);

interface NavbarProps {
  user: { email: string; name?: string | null; theme: "dark" | "light" };
}

function UserMonogram({
  name,
  email,
}: {
  name?: string | null;
  email: string;
}) {
  const initials = name
    ? name
        .split(" ")
        .map(char => char[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : email[0].toUpperCase();

  return (
    <div
      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30"
      aria-hidden="true"
    >
      <span className="text-xs font-semibold leading-none">{initials}</span>
    </div>
  );
}

export function Navbar({ user }: NavbarProps) {
  const updateTheme = useServerFn(updateThemeFn);

  const onUpdate = useCallback(
    (theme: "dark" | "light") => {
      updateTheme({ data: { theme } }).catch(() =>
        toast.error("Something very weird is going on. Try again later!")
      );
    },
    [updateTheme]
  );

  const { theme, toggle } = useTheme(user.theme, onUpdate);

  const accountTrigger = (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Account menu"
      className="rounded-full hover:bg-accent/60"
    >
      <UserMonogram name={user.name} email={user.email} />
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 flex h-13 items-center border-b border-border/50 bg-background/80 backdrop-blur-sm px-5">
      {/* Brand */}
      <div className="flex flex-1 items-center">
        <Link
          to="/"
          aria-label="My TanStack Starter — home"
          className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/50"
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary"
            aria-hidden="true"
          >
            <span className="font-display text-sm font-bold italic text-primary-foreground leading-none">
              T
            </span>
          </div>
          <span
            className="hidden font-display text-sm font-semibold italic text-foreground/90 group-hover:text-foreground transition-colors sm:inline"
            aria-hidden="true"
          >
            TanStack
          </span>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun size={16} aria-hidden="true" />
          ) : (
            <Moon size={16} aria-hidden="true" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={accountTrigger} />
          <DropdownMenuContent align="end" className="min-w-52" sideOffset={8}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="py-2">
                {user.name && (
                  <p className="text-sm font-medium">{user.name}</p>
                )}
                <p
                  className={
                    user.name
                      ? "text-xs text-muted-foreground"
                      : "text-sm font-medium"
                  }
                >
                  {user.email}
                </p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={profileLink} />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive data-highlighted:text-destructive"
              render={signOutLink}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
