import { Link } from "@tanstack/react-router";
import { Home, Upload, LogIn, LogOut, User } from "lucide-react";

interface NavbarProps {
  user: { email: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link
                to="/"
                activeProps={{
                  className: "active",
                }}
                activeOptions={{ exact: true }}
                className="flex items-center gap-2"
              >
                <Home size={16} />
                Home
              </Link>
            </li>
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          <span className="text-primary">=�</span>
          Tanstack Start Sqlite
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link
              to="/"
              activeProps={{
                className: "active",
              }}
              activeOptions={{ exact: true }}
              className="flex items-center gap-2"
            >
              <Home size={16} />
              Home
            </Link>
          </li>
        </ul>
      </div>

      <div className="navbar-end">
        {user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <User size={16} />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <div className="justify-between">
                  <span className="text-base-content/70">{user.email}</span>
                </div>
              </li>
              <li>
                <Link
                  to="/logout"
                  className="flex items-center gap-2 text-error"
                >
                  <LogOut size={16} />
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary flex items-center gap-2">
            <LogIn size={16} />
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
