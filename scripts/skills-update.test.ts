import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
      name: string
    ) => Promise<void>
  >(),
}));

vi.mock("node:fs/promises", () => ({ ...mocks, default: mocks }));

describe("skills:update", () => {
  beforeEach(() => {
    vi.resetModules();
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
      if (path.endsWith("SKILL.MD")) return "Use pnpm dlx security-tool";
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
  });

  afterEach(() => vi.unstubAllGlobals());

  it("refreshes only tracked skills in the shared directory and normalizes commands", async () => {
    await import("./skills-update.ts");

    expect(mocks.run.mock.calls.map(call => call.slice(1))).toStrictEqual([
      ["better-auth/skills", "auth"],
      ["better-auth/skills", "password"],
      ["https://evlog.dev", "logs"],
    ]);
    for (const [command] of mocks.run.mock.calls) {
      expect(command.join("")).toBe(
        "bunx skills add  --skill  --agent universal --yes"
      );
    }
    expect(mocks.writeFile.mock.calls).toStrictEqual([
      [".agents/skills/auth/SKILL.md", "Use bunx tool"],
      [".agents/skills/security/SKILL.MD", "Use bunx security-tool"],
    ]);
    expect(mocks.readFile).not.toHaveBeenCalledWith(
      ".agents/skills/auth/logo.png",
      "utf8"
    );
  });

  it("signals potential renames and normalizes files after a failed update", async () => {
    mocks.run.mockRejectedValueOnce(new Error("Skill not found"));
    await expect(import("./skills-update.ts")).rejects.toThrow(
      'Could not update "auth" from better-auth/skills. Check upstream for a renamed or removed skill.'
    );
    expect(mocks.run.mock.calls.map(call => call.slice(1))).toStrictEqual([
      ["better-auth/skills", "auth"],
    ]);
    expect(mocks.writeFile).toHaveBeenCalledTimes(2);
  });
});
