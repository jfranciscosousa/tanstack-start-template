const ERROR_CODES = {
  NOT_FOUND: "NOT_FOUND",
  UNPROCESSEABLE_ENTITY: "UNPROCESSABLE_ENTITY",
  UNAUTHORIZED: "UNAUTHORIZED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  BAD_REQUEST: "BAD_REQUEST",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
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
  code: ErrorCode;

  constructor(code: ErrorCode, message?: string) {
    super(message || DEFAULT_MESSAGES[code]);
    this.code = code;
    this.name = "AppError";
  }
}

function isZodIssues(error: any) {
  if (typeof error.message !== "string") return;

  try {
    return JSON.parse(error.message);
  } catch (_) {
    return false;
  }
}

export function renderError(error: unknown): string {
  if (isZodIssues(error)) {
    return DEFAULT_MESSAGES[ERROR_CODES.UNPROCESSEABLE_ENTITY];
  }

  if (error && typeof error === "object" && (error as any)?.message) {
    return (error as any).message;
  }

  return DEFAULT_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR];
}
