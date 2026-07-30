import { describe, expect, it } from "vitest";

import { getServerFunctionName } from "./server-function-log";

describe("getServerFunctionName", () => {
  it("extracts a server function's exported name", () => {
    const metadata = Buffer.from(
      JSON.stringify({
        export: "getTodosFn_createServerFn_handler",
        file: "/src/server/handlers/todo-handlers.ts?tss-serverfn-split",
      })
    ).toString("base64url");

    expect(getServerFunctionName(`/_serverFn/${metadata}`)).toBe("getTodosFn");
  });

  it("ignores non-server-function and malformed paths", () => {
    expect(getServerFunctionName("/todos")).toBeUndefined();
    expect(getServerFunctionName("/_serverFn/not-base64")).toBeUndefined();
  });
});
