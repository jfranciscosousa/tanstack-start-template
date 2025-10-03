import { Link } from "@tanstack/react-router";
import { Home, CheckSquare, LogIn, LogOut, User, Menu, Settings } from "lucide-react";
import { Avatar } from "./Avatar";

interface NavbarProps {
  user?: { email: string };
}

export function Navbar({ user }: NavbarProps) {
  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <Menu size={20} />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow-lg border border-base-300"
          >
            <li>
              <Link
                to="/"
                activeProps={{
                  className: "active bg-primary/20 text-primary",
                }}
                activeOptions={{ exact: true }}
                className="flex items-center gap-3 py-3"
              >
                <Home size={18} />
                Dashboard
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to="/todos"
                  activeProps={{
                    className: "active bg-primary/20 text-primary",
                  }}
                  className="flex items-center gap-3 py-3"
                >
                  <CheckSquare size={18} />
                  Todos
                </Link>
              </li>
            )}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-lg font-bold px-2">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <span className="text-sm font-bold">TS</span>
            </Avatar>
            <span className="hidden sm:inline">TanStack Start</span>
          </div>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li>
            <Link
              to="/"
              activeProps={{
                className: "active bg-primary/20 text-primary",
              }}
              activeOptions={{ exact: true }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-base-200"
            >
              <Home size={18} />
              Dashboard
            </Link>
          </li>
          {user && (
            <li>
              <Link
                to="/todos"
                activeProps={{
                  className: "active bg-primary/20 text-primary",
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-base-200"
              >
                <CheckSquare size={18} />
                Todos
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <Avatar size="md">
                <User size={18} />
              </Avatar>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-64 p-3 shadow-lg border border-base-300"
            >
              <li className="menu-title">
                <span className="text-xs uppercase tracking-wider">Account</span>
              </li>
              <li>
                <div className="flex flex-col px-4 py-3 bg-base-200 rounded-lg mb-2">
                  <span className="text-sm font-medium">{user.email}</span>
                  <span className="text-xs text-base-content/60">Signed in</span>
                </div>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-base-200 rounded-lg"
                >
                  <Settings size={18} />
                  Edit Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/logout"
                  className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 rounded-lg"
                >
                  <LogOut size={18} />
                  Sign out
                </Link>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm gap-2">
            <LogIn size={16} />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
        )}
      </div>
    </div>
  );
}
