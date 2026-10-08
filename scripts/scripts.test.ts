import { afterEach, describe, expect, it } from "vitest";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import {
  mkdtempSync,
  mkdirSync,
  existsSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { execFileSync, spawn } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const folders: string[] = [];
function fixture() {
  const folder = mkdtempSync(join(tmpdir(), "bun-scripts-test-"));
  folders.push(folder);
  return folder;
}
function run(script: string, folder: string, env: Record<string, string> = {}) {
  return execFileSync("bun", [join(root, "scripts/run.ts"), script], {
    cwd: folder,
    env: { ...process.env, CI: "true", ...env },
    encoding: "utf8",
    timeout: 10000,
  });
}
describe("native Bun scripts", () => {
  afterEach(() => {
    for (const folder of folders.splice(0)) {
      rmSync(folder, { recursive: true, force: true });
    }
  });

  it("clean removes every artifact and preserves unrelated files", () => {
    const folder = fixture();
    const artifacts = [
      "playwright-report",
      "build",
      "public/build",
      ".cache",
      "test-results",
      ".output",
      ".vercel/output",
      ".tanstack",
      ".nitro",
      "dist",
    ];
    for (const artifact of artifacts) {
      mkdirSync(join(folder, artifact), { recursive: true });
    }
    writeFileSync(join(folder, "keep.txt"), "keep");
    run(join(root, "scripts/clean.ts"), folder);
    expect(
      artifacts.filter(artifact => existsSync(join(folder, artifact)))
    ).toStrictEqual([]);
    expect(readFileSync(join(folder, "keep.txt"), "utf8")).toBe("keep");
  });

  it.each([
    [{ PORT: "3081", NITRO_PORT: "" }, "3081"],
    [{ PORT: "3081", NITRO_PORT: "3082" }, "3082"],
  ])(
    "start forwards the runtime port without overriding NITRO_PORT: %j",
    (ports, expected) => {
      const folder = fixture();
      mkdirSync(join(folder, ".output/server"), { recursive: true });
      writeFileSync(
        join(folder, ".output/server/index.mjs"),
        "console.log('port=' + process.env.NITRO_PORT)"
      );
      const env = { ...ports };
      if (!env.NITRO_PORT) delete (env as Partial<typeof env>).NITRO_PORT;
      // Do not inherit a host-specific Nitro port in the subprocess fixture.
      const output = run(join(root, "scripts/start.ts"), folder, env);
      expect(output).toContain(`port=${expected}`);
    }
  );

  it("runner preserves arguments and subprocess failure codes", () => {
    const folder = fixture();
    const script = join(folder, "args.ts");
    writeFileSync(script, "console.log(JSON.stringify(process.argv.slice(2)))");
    const args = ["space value", ";$(echo bad)", "", "line\\nbreak"];
    const output = execFileSync(
      "bun",
      [join(root, "scripts/run.ts"), script, ...args],
      { encoding: "utf8" }
    );
    expect(JSON.parse(output)).toStrictEqual(args);
    writeFileSync(
      script,
      'import { $ } from "bun"; await $`bun -e "process.exit(37)"`;'
    );
    try {
      run(script, folder);
      throw new Error("Expected a subprocess failure");
    } catch (error) {
      expect((error as { status: number }).status).toBe(37);
    }
  });

  it.each(["answer", "eof", "interrupt"])(
    "question handles %s without hanging",
    async mode => {
      const folder = fixture();
      const script = join(folder, "prompt.ts");
      writeFileSync(
        script,
        `import { question } from ${JSON.stringify(join(root, "scripts/helpers/question.ts"))}; console.log('answer=' + await question('ready: '));`
      );
      const result = await new Promise<{ code: number | null; output: string }>(
        (resolveResult, reject) => {
          const child = spawn("bun", [join(root, "scripts/run.ts"), script], {
            cwd: folder,
          });
          let output = "";
          const timeout = setTimeout(() => {
            child.kill("SIGKILL");
            reject(new Error("Prompt did not exit"));
          }, 5000);
          child.on("error", reject);
          child.stdout.on("data", data => {
            output += data.toString();
            if (output.includes("ready: ")) {
              if (mode === "answer") child.stdin.end("yes\n");
              if (mode === "eof") child.stdin.end();
              if (mode === "interrupt") {
                setTimeout(() => child.kill("SIGINT"), 50);
              }
            }
          });
          child.on("close", code => {
            clearTimeout(timeout);
            resolveResult({ code, output });
          });
        }
      );
      const codes = { answer: 0, interrupt: 130, eof: 1 };
      expect(result.code).toBe(codes[mode as keyof typeof codes]);
      if (mode === "answer") expect(result.output).toContain("answer=yes");
    }
  );
});
