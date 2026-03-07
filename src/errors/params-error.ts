/* oxlint-disable @typescript-eslint/no-explicit-any */
/* oxlint-disable @typescript-eslint/no-unsafe-member-access */

export type ParamsErrorMeta = Record<string, string[]>;

/**
 * Thrown when service-level validation fails on specific fields (e.g. "email
 * already taken", "wrong current password"). Always represents a 422
 * Unprocessable Entity. The `meta` object maps field names to arrays of error
 * messages, matching the shape expected by the Form component.
 *
 * The meta is embedded in `message` as JSON so it survives HTTP serialization
 * (TanStack Start only preserves `message` across the wire).
 */
export class ParamsError extends Error {
  name = "ParamsError" as const;
  meta: ParamsErrorMeta;

  constructor(meta: ParamsErrorMeta) {
    super(JSON.stringify({ type: "ParamsError", meta }));
    this.meta = meta;
  }
}

export function isParamsError(
  error: unknown
): error is { name: "ParamsError"; meta: ParamsErrorMeta } {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  // Server-side: class instance still has meta directly
  if (
    (error as any).name === "ParamsError" &&
    typeof (error as any).meta === "object" &&
    (error as any).meta !== null
  ) {
    return true;
  }

  // Client-side after HTTP serialization: only message survives
  if (typeof (error as any).message === "string") {
    try {
      const parsed = JSON.parse((error as any).message);
      if (
        parsed?.type === "ParamsError" &&
        typeof parsed.meta === "object" &&
        parsed.meta !== null
      ) {
        // Normalize so the type predicate holds on the deserialized object
        (error as any).meta = parsed.meta;
        return true;
      }
    } catch {
      // Not JSON — not a ParamsError
    }
  }

  return false;
}
