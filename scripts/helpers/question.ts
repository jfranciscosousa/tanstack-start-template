import { createInterface } from "node:readline/promises";

export async function question(message: string): Promise<string> {
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const controller = new AbortController();
  let interrupted = false;
  function close() {
    controller.abort();
  }
  function interrupt() {
    interrupted = true;
    controller.abort();
  }
  prompt.once("close", close);
  prompt.once("SIGINT", interrupt);
  process.once("SIGINT", interrupt);
  try {
    return await prompt.question(message, { signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw Object.assign(
        new Error(
          interrupted ? "Prompt interrupted." : "Input closed before an answer."
        ),
        { exitCode: interrupted ? 130 : 1 }
      );
    }
    throw error;
  } finally {
    process.removeListener("SIGINT", interrupt);
    prompt.removeListener("close", close);
    prompt.close();
  }
}
