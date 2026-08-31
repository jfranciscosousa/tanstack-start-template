import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

function hasExitCode(error: unknown): error is { exitCode: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "exitCode" in error &&
    typeof error.exitCode === "number"
  );
}

const [scriptPath, ...args] = process.argv.slice(3);

if (!scriptPath) {
  console.error("❌ Specify a script to run.");
  process.exitCode = 1;
} else {
  process.argv = [...process.argv.slice(0, 2), scriptPath, ...args];

  try {
    await import(pathToFileURL(resolve(scriptPath)).href);
  } catch (error) {
    if (!hasExitCode(error)) {
      console.error(error instanceof Error ? error.message : error);
    }

    process.exitCode = hasExitCode(error) ? error.exitCode : 1;
  }
}
