import { join } from "node:path";
import { readFile, readdir, writeFile } from "node:fs/promises";

const lock = JSON.parse(await readFile("skills-lock.json", "utf8")) as {
  skills: Record<string, { source: string; sourceType: string }>;
};
const sources = new Map<string, string[]>();

for (const [name, skill] of Object.entries(lock.skills)) {
  const source =
    skill.sourceType === "well-known"
      ? `https://${skill.source}`
      : skill.source;
  sources.set(source, [...(sources.get(source) ?? []), name]);
}

$.stdio = "inherit";
try {
  for (const [source, names] of sources) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- Each install writes skills-lock.json.
    await $`pnpm dlx skills add ${source} --skill ${names} --agent universal --yes`;
  }
} finally {
  const files = await readdir(".agents/skills", { recursive: true });
  await Promise.all(
    files
      .filter(file => file.toLowerCase().endsWith(".md"))
      .map(async file => {
        const path = join(".agents/skills", file);
        const content = await readFile(path, "utf8");
        const updated = content.replace(/\bnp[x]\b/g, "pnpm dlx");
        if (updated !== content) await writeFile(path, updated);
      })
  );
}
