import { join } from "node:path";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { $ } from "bun";

const lock = JSON.parse(await readFile("skills-lock.json", "utf8")) as {
  skills: Record<string, { source: string; sourceType: string }>;
};
try {
  for (const [name, skill] of Object.entries(lock.skills)) {
    const source =
      skill.sourceType === "well-known"
        ? `https://${skill.source}`
        : skill.source;
    // oxlint-disable-next-line eslint/no-await-in-loop -- Each install writes skills-lock.json.
    await $`bunx skills add ${source} --skill ${name} --agent universal --yes`.catch(
      error => {
        throw new Error(
          `Could not update "${name}" from ${source}. Check upstream for a renamed or removed skill.`,
          { cause: error }
        );
      }
    );
  }
} finally {
  const files = await readdir(".agents/skills", { recursive: true });
  await Promise.all(
    files
      .filter(file => file.toLowerCase().endsWith(".md"))
      .map(async file => {
        const path = join(".agents/skills", file);
        const content = await readFile(path, "utf8");
        const updated = content.replace(/\b(?:np[x]|pnpm dlx)\b/g, "bunx");
        if (updated !== content) await writeFile(path, updated);
      })
  );
}
