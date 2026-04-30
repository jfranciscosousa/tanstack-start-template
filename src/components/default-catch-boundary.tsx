/* eslint-disable no-console */
import type React from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";

import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
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
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <ErrorComponent error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleTryAgain}
          className="rounded bg-gray-600 px-2 py-1 font-extrabold text-white uppercase dark:bg-gray-700"
        >
          Try Again
        </button>
        {isRoot ? (
          <Link
            to="/"
            className="rounded bg-gray-600 px-2 py-1 font-extrabold text-white uppercase dark:bg-gray-700"
          >
            Home
          </Link>
        ) : (
          <Link
            to="/"
            className="rounded bg-gray-600 px-2 py-1 font-extrabold text-white uppercase dark:bg-gray-700"
            onClick={handleGoBack}
          >
            Go Back
          </Link>
        )}
      </div>
    </div>
  );
}
