import postgres from "postgres";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

const DEFAULT_PORT = 3000;

const [subcommand, ...args] = process.argv.slice(3);

const repoRoot = (await $`git rev-parse --show-toplevel`).stdout.trim();
const repoName = path.basename(repoRoot);
const worktreesRoot = path.resolve(repoRoot, "..", "worktrees", repoName);

interface WorktreeInfo {
  name: string;
  path: string;
  branch: string;
  isMain: boolean;
  port: number | null;
  databaseUrl: string | null;
}

async function listWorktrees(): Promise<WorktreeInfo[]> {
  const { stdout } = await $`git worktree list --porcelain`.quiet();
  const blocks = stdout.split("\n\n").filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split("\n");
    const wtPath =
      lines.find(line => line.startsWith("worktree "))?.slice(9) ?? "";
    const branch =
      lines
        .find(line => line.startsWith("branch "))
        ?.slice(7)
        .replace("refs/heads/", "") ?? "(detached)";

    const env = readEnv(path.join(wtPath, ".env"));
    const port = env.PORT ? Number(env.PORT) : null;
    const databaseUrl = env.DATABASE_URL ?? null;

    return {
      name: path.basename(wtPath),
      path: wtPath,
      branch,
      isMain: index === 0,
      port,
      databaseUrl,
    };
  });
}

function readEnv(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const result: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const match = line.match(/^(?<key>[A-Z_][A-Z0-9_]*)=(?<value>.*)$/);
    if (match) {
      const { key, value } = match.groups ?? {};
      if (key !== undefined && value !== undefined) result[key] = value;
    }
  }
  return result;
}

function dbNameFromUrl(url: string): string {
  return new URL(url).pathname.replace(/^\//, "");
}

function replaceDbName(url: string, newName: string): string {
  const parsed = new URL(url);
  parsed.pathname = `/${newName}`;
  return parsed.toString();
}

async function cmdList() {
  const worktrees = await listWorktrees();

  const existingDbs = await fetchExistingDbs(worktrees);

  const portCounts = new Map<number, number>();
  for (const wt of worktrees) {
    const port = wt.port ?? DEFAULT_PORT;
    portCounts.set(port, (portCounts.get(port) ?? 0) + 1);
  }

  let issueCount = 0;

  console.log(`Found ${worktrees.length} worktree(s):\n`);
  for (const wt of worktrees) {
    const tag = wt.isMain ? "main" : "worktree";
    const dbName = wt.databaseUrl ? dbNameFromUrl(wt.databaseUrl) : null;
    const port = wt.port ?? DEFAULT_PORT;

    const issues: string[] = [];
    if (!fs.existsSync(wt.path)) issues.push("worktree dir is missing");
    if (!wt.databaseUrl || !dbName) issues.push("no .env / DATABASE_URL");
    else if (existingDbs && !existingDbs.has(dbName)) {
      issues.push(`database '${dbName}' does not exist`);
    }
    if ((portCounts.get(port) ?? 0) > 1) {
      issues.push(`port ${port} conflicts with another worktree`);
    }

    issueCount += issues.length;

    console.log(`  [${tag}] ${wt.name}${issues.length ? "  ⚠️" : ""}`);
    console.log(`    path:   ${wt.path}`);
    console.log(`    branch: ${wt.branch}`);
    console.log(`    port:   ${port}`);
    console.log(`    db:     ${dbName ?? "(no .env)"}`);
    for (const issue of issues) console.log(`    ⚠️  ${issue}`);
    console.log();
  }

  if (issueCount > 0) {
    console.log(
      `⚠️  ${issueCount} issue(s) found. Run \`pnpm worktree cleanup\` to prune orphans.`
    );
  }
}

async function fetchExistingDbs(
  worktrees: WorktreeInfo[]
): Promise<Set<string> | null> {
  const url = worktrees.find(wt => wt.databaseUrl)?.databaseUrl;
  if (!url) return null;
  try {
    const sql = postgres(replaceDbName(url, "postgres"));
    const rows = await sql<{ datname: string }[]>`
      SELECT datname FROM pg_database
    `;
    await sql.end();
    return new Set(rows.map(row => row.datname));
  } catch {
    return null;
  }
}

async function cmdCreate(name: string) {
  if (!name) {
    console.error("❌ Usage: pnpm worktree create <name>");
    process.exit(1);
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    console.error(
      "❌ Worktree name must be lowercase alphanumeric with dashes"
    );
    process.exit(1);
  }

  const worktrees = await listWorktrees();
  if (worktrees.some(wt => !wt.isMain && wt.name === name)) {
    console.error(`❌ Worktree '${name}' already exists`);
    process.exit(1);
  }

  const mainEnv = readEnv(path.join(repoRoot, ".env"));
  if (!mainEnv.DATABASE_URL) {
    console.error("❌ Main .env has no DATABASE_URL. Run `pnpm setup` first.");
    process.exit(1);
  }

  const maxPort = Math.max(
    DEFAULT_PORT,
    ...worktrees.map(wt => wt.port ?? DEFAULT_PORT)
  );
  const newPort = maxPort + 1;

  const sourceDb = dbNameFromUrl(mainEnv.DATABASE_URL);
  const newDb = `${sourceDb}_${name.replace(/-/g, "_")}`;
  const newDbUrl = replaceDbName(mainEnv.DATABASE_URL, newDb);
  const worktreePath = path.join(worktreesRoot, name);

  fs.mkdirSync(worktreesRoot, { recursive: true });

  console.log(`📋 Plan:`);
  console.log(`   path:   ${worktreePath}`);
  console.log(`   branch: ${name}`);
  console.log(`   port:   ${newPort}`);
  console.log(`   db:     ${newDb} (cloned from ${sourceDb})\n`);

  console.log(`🌿 Creating git worktree...`);
  await $`git worktree add ${worktreePath} -b ${name}`;

  console.log(`🗄️  Cloning database ${sourceDb} → ${newDb}...`);
  await cloneDatabase(mainEnv.DATABASE_URL, sourceDb, newDb);

  console.log(`📦 Cloning node_modules (APFS clonefile)...`);
  await cloneNodeModules(repoRoot, worktreePath);

  console.log(`📄 Writing .env...`);
  writeWorktreeEnv(worktreePath, mainEnv, { newDbUrl, newPort });

  console.log(`\n✅ Worktree '${name}' ready`);
  console.log(`   cd ${worktreePath} && pnpm dev`);
}

async function cmdDelete(name: string) {
  if (!name) {
    console.error("❌ Usage: pnpm worktree delete <name>");
    process.exit(1);
  }

  const worktrees = await listWorktrees();
  const target = worktrees.find(wt => !wt.isMain && wt.name === name);

  const mainEnv = readEnv(path.join(repoRoot, ".env"));
  const expectedDb =
    mainEnv.DATABASE_URL &&
    `${dbNameFromUrl(mainEnv.DATABASE_URL)}_${name.replace(/-/g, "_")}`;
  const expectedPath = path.join(worktreesRoot, name);
  const expectedBranch = name;

  if (target?.isMain) {
    console.error(`❌ Refusing to delete the main worktree`);
    process.exit(1);
  }

  const wtPath = target?.path ?? expectedPath;
  const branch =
    target?.branch && target.branch !== "(detached)"
      ? target.branch
      : expectedBranch;
  const dbName = target?.databaseUrl
    ? dbNameFromUrl(target.databaseUrl)
    : (expectedDb ?? null);
  const dbUrl = target?.databaseUrl ?? mainEnv.DATABASE_URL ?? null;

  if (!target) {
    console.log(
      `⚠️  No matching git worktree found — proceeding with best-effort cleanup of:`
    );
    console.log(
      `   path:   ${wtPath} ${fs.existsSync(wtPath) ? "" : "(missing)"}`
    );
    console.log(`   branch: ${branch}`);
    console.log(`   db:     ${dbName ?? "?"}`);
  }

  const confirm = await question(`Delete '${target?.name ?? name}'? [y/N]: `);
  if (confirm.toLowerCase() !== "y") {
    console.log("Aborted.");
    return;
  }

  if (fs.existsSync(wtPath)) {
    console.log(`🌿 Removing git worktree at ${wtPath}...`);
    await $`git worktree remove ${wtPath} --force`.nothrow();
  } else if (target) {
    console.log(`🌿 Worktree dir missing — pruning git records...`);
    await $`git worktree prune`.nothrow();
  }

  console.log(`🌿 Deleting branch ${branch}...`);
  await $`git branch -D ${branch}`.nothrow();

  if (dbName && dbUrl) {
    console.log(`🗄️  Dropping database ${dbName}...`);
    await dropDatabase(dbUrl, dbName);
  }

  console.log(`\n✅ Cleanup complete for '${target?.name ?? name}'`);
}

async function cmdCleanup() {
  const mainEnv = readEnv(path.join(repoRoot, ".env"));
  if (!mainEnv.DATABASE_URL) {
    console.error("❌ Main .env has no DATABASE_URL.");
    process.exit(1);
  }
  const sourceDb = dbNameFromUrl(mainEnv.DATABASE_URL);

  console.log(`🔍 Scanning for orphans...\n`);

  console.log(`🌿 Pruning stale git worktree records...`);
  await $`git worktree prune -v`.nothrow();

  const worktrees = await listWorktrees();
  const expectedDbs = new Set(
    worktrees
      .filter(tree => !tree.isMain)
      .map(tree => `${sourceDb}_${tree.name.replace(/-/g, "_")}`)
  );
  expectedDbs.add(sourceDb);

  const adminUrl = replaceDbName(mainEnv.DATABASE_URL, "postgres");
  const sql = postgres(adminUrl);
  const rows = await sql<{ datname: string }[]>`
    SELECT datname FROM pg_database
    WHERE datname LIKE ${`${sourceDb}_%`}
  `;
  await sql.end();

  const orphans = rows
    .map(row => row.datname)
    .filter(db => !expectedDbs.has(db));

  if (orphans.length === 0) {
    console.log(`\n✅ No orphan databases found.`);
    return;
  }

  console.log(`\nFound ${orphans.length} orphan database(s):`);
  for (const db of orphans) console.log(`  - ${db}`);

  const confirm = await question(`\nDrop all ${orphans.length}? [y/N]: `);
  if (confirm.toLowerCase() !== "y") {
    console.log("Aborted.");
    return;
  }

  await Promise.all(
    orphans.map(async db => {
      console.log(`🗄️  Dropping ${db}...`);
      await dropDatabase(mainEnv.DATABASE_URL, db);
    })
  );

  console.log(`\n✅ Cleanup complete`);
}

async function cloneDatabase(
  sourceUrl: string,
  sourceDb: string,
  newDb: string
) {
  const adminUrl = replaceDbName(sourceUrl, "postgres");
  const sql = postgres(adminUrl);
  try {
    await sql.unsafe(`CREATE DATABASE "${newDb}" WITH TEMPLATE "${sourceDb}"`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("being accessed by other users")) {
      console.error(
        `❌ Cannot clone '${sourceDb}' — it has active connections. Stop your dev server and retry.`
      );
    } else {
      console.error(`❌ Database clone failed: ${message}`);
    }
    await sql.end();
    process.exit(1);
  }
  await sql.end();
}

async function dropDatabase(url: string, dbName: string) {
  const adminUrl = replaceDbName(url, "postgres");
  const sql = postgres(adminUrl);
  try {
    await sql.unsafe(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`⚠️  Could not drop database: ${message}`);
  }
  await sql.end();
}

async function cloneNodeModules(from: string, to: string) {
  const src = path.join(from, "node_modules");
  const dst = path.join(to, "node_modules");
  if (!fs.existsSync(src)) {
    console.log(`   (no node_modules in main, running pnpm install instead)`);
    await $`cd ${to} && pnpm install`;
    return;
  }

  if (os.platform() === "darwin") {
    await $`cp -cR ${src} ${dst}`;
  } else {
    await $`cp -R ${src} ${dst}`;
  }
}

function writeWorktreeEnv(
  worktreePath: string,
  mainEnv: Record<string, string>,
  overrides: { newDbUrl: string; newPort: number }
) {
  const envPath = path.join(worktreePath, ".env");
  const sourceEnvPath = path.join(repoRoot, ".env");
  let content = fs.readFileSync(sourceEnvPath, "utf8");

  content = content.replace(
    /^DATABASE_URL=.*$/m,
    `DATABASE_URL=${overrides.newDbUrl}`
  );

  if (/^PORT=/m.test(content)) {
    content = content.replace(/^PORT=.*$/m, `PORT=${overrides.newPort}`);
  } else {
    content = `${content.trimEnd()}\nPORT=${overrides.newPort}\n`;
  }

  const newAuthUrl = `http://localhost:${overrides.newPort}`;
  if (mainEnv.BETTER_AUTH_URL) {
    content = content.replace(
      /^BETTER_AUTH_URL=.*$/m,
      `BETTER_AUTH_URL=${newAuthUrl}`
    );
  }

  fs.writeFileSync(envPath, content);
}

switch (subcommand) {
  case "list":
  case "ls":
  case undefined:
    await cmdList();
    break;
  case "create":
  case "add":
    await cmdCreate(args[0]);
    break;
  case "delete":
  case "remove":
  case "rm":
    await cmdDelete(args[0]);
    break;
  case "cleanup":
  case "prune":
    await cmdCleanup();
    break;
  default:
    console.error(`Unknown subcommand: ${subcommand}`);
    console.error(
      `Usage: pnpm worktree [list|create <name>|delete <name>|cleanup]`
    );
    process.exit(1);
}
