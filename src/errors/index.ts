// oxlint-disable typescript/no-explicit-any
export { ParamsError, isParamsError } from "./params-error";
export type { ParamsErrorMeta } from "./params-error";

const ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  UNAUTHORIZED: "UNAUTHORIZED",
  UNPROCESSEABLE_ENTITY: "UNPROCESSABLE_ENTITY",
} as const;

const DEFAULT_MESSAGES = {
  [ERROR_CODES.NOT_FOUND]: "The requested resource was not found.",
  [ERROR_CODES.UNPROCESSEABLE_ENTITY]:
    "The request was well-formed but was unable to be followed due to semantic errors.",
  [ERROR_CODES.UNAUTHORIZED]: "You are not authorized to access this resource.",
  [ERROR_CODES.UNAUTHENTICATED]:
    "You must be authenticated to access this resource.",
  [ERROR_CODES.FORBIDDEN]:
    "You do not have permission to access this resource.",
  [ERROR_CODES.BAD_REQUEST]:
    "The request could not be understood by the server due to malformed syntax.",
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: "An unexpected error occurred.",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  public code: ErrorCode;
  public publicMessage: string;

  public constructor(code: ErrorCode, publicMessage?: string) {
    const message = publicMessage || DEFAULT_MESSAGES[code];
    super(JSON.stringify({ type: "AppError", code, publicMessage: message }));
    this.code = code;
    this.publicMessage = message;
    this.name = "AppError";
  }
}

function isAppError(
  error: unknown
): error is { code: ErrorCode; publicMessage: string } {
  if (error instanceof AppError) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const { message } = error as any;
  if (typeof message !== "string") {
    return false;
  }

  try {
    const parsed = JSON.parse(message);
    if (
      parsed?.type !== "AppError" ||
      !Object.values(ERROR_CODES).includes(parsed.code) ||
      typeof parsed.publicMessage !== "string"
    ) {
      return false;
    }

    (error as any).code = parsed.code;
    (error as any).publicMessage = parsed.publicMessage;
    return true;
  } catch {
    return false;
  }
}

function isZodIssues(error: any) {
  if (typeof error.message !== "string") {
    return;
  }

  try {
    return JSON.parse(error.message);
  } catch (_err) {
    return false;
  }
}

export function renderError(error: unknown): string {
  if (isAppError(error)) {
    return error.publicMessage;
  }

  if (isZodIssues(error)) {
    return DEFAULT_MESSAGES[ERROR_CODES.UNPROCESSEABLE_ENTITY];
  }

  return DEFAULT_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR];
}
