import { Link } from "@tanstack/react-router";
import { LogOut, Settings, User } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar } from "./Avatar";

const accountTrigger = (
  <Button variant="ghost" size="icon" aria-label="Account menu">
    <Avatar size="sm">
      <User size={16} />
    </Avatar>
  </Button>
);

const profileLink = (
  <Link to="/profile" className="flex w-full items-center gap-2">
    <Settings size={14} />
    Edit Profile
  </Link>
);

const signOutLink = (
  <Link to="/logout" className="flex w-full items-center gap-2">
    <LogOut size={14} />
    Sign out
  </Link>
);

interface NavbarProps {
  user: { email: string; name?: string | null };
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b bg-card px-4 shadow-sm">
      {/* Brand */}
      <div className="flex flex-1 items-center gap-2">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold transition-colors hover:bg-accent"
        >
          <Avatar size="sm">
            <span className="text-xs font-bold">TS</span>
          </Avatar>
          <span className="hidden sm:inline">TanStack Start</span>
        </Link>
      </div>

      {/* User menu */}
      <div className="flex flex-1 items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger render={accountTrigger} />
          <DropdownMenuContent align="end" className="min-w-min" sideOffset={8}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>
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
