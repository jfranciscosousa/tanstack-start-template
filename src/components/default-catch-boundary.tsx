/* eslint-disable no-console */
import type React from "react";
import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    select: state => state.id === rootRouteId,
    strict: false,
  });

  console.error(error);

  function handleTryAgain() {
    void router.invalidate();
  }

  function handleGoBack(event: React.MouseEvent) {
    event.preventDefault();
    window.history.back();
  }

  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <ErrorComponent error={error} />
      <div className="flex gap-2 items-center flex-wrap">
        <button
          type="button"
          onClick={handleTryAgain}
          className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold"
        >
          Try Again
        </button>
        {isRoot ? (
          <Link
            to="/"
            className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold"
          >
            Home
          </Link>
        ) : (
          <Link
            to="/"
            className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold"
            onClick={handleGoBack}
          >
            Go Back
          </Link>
        )}
      </div>
    </div>
  );
}
