import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readFile: vi.fn<(path: string, encoding: string) => Promise<string>>(),
  readdir:
    vi.fn<
      (path: string, options: { recursive: boolean }) => Promise<string[]>
    >(),
  writeFile: vi.fn<(path: string, content: string) => Promise<void>>(),
  run: vi.fn<
    (
      command: TemplateStringsArray,
      source: string,
      names: string[]
    ) => Promise<void>
  >(),
}));

vi.mock("node:fs/promises", () => ({ ...mocks, default: mocks }));

describe("skills:update", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("refreshes only tracked skills in the shared directory and normalizes commands", async () => {
    const lock = {
      skills: {
        auth: { source: "better-auth/skills", sourceType: "github" },
        password: { source: "better-auth/skills", sourceType: "github" },
        logs: { source: "evlog.dev", sourceType: "well-known" },
      },
    };
    const legacyRunner = ["np", "x"].join("");
    mocks.readFile.mockImplementation(async (path: string) => {
      if (path === "skills-lock.json") return JSON.stringify(lock);
      if (path.endsWith("SKILL.md")) return `Use ${legacyRunner} tool`;
      if (path.endsWith("SKILL.MD")) return `Use ${legacyRunner} security-tool`;
      return "Keep this guidance";
    });
    mocks.readdir.mockResolvedValue([
      "auth/SKILL.md",
      "auth/references/guide.md",
      "security/SKILL.MD",
      "auth/logo.png",
    ]);
    mocks.run.mockResolvedValue(undefined);
    mocks.writeFile.mockResolvedValue(undefined);
    vi.stubGlobal("$", mocks.run);

    await import("./skills-update.ts");

    expect(mocks.run.mock.calls.map(call => call.slice(1))).toStrictEqual([
      ["better-auth/skills", ["auth", "password"]],
      ["https://evlog.dev", ["logs"]],
    ]);
    for (const [command] of mocks.run.mock.calls) {
      expect(command.join("")).toBe(
        "pnpm dlx skills add  --skill  --agent universal --yes"
      );
    }
    expect(mocks.writeFile.mock.calls).toStrictEqual([
      [".agents/skills/auth/SKILL.md", "Use pnpm dlx tool"],
      [".agents/skills/security/SKILL.MD", "Use pnpm dlx security-tool"],
    ]);
    expect(mocks.readFile).not.toHaveBeenCalledWith(
      ".agents/skills/auth/logo.png",
      "utf8"
    );
  });
});
