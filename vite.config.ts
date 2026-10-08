import { defineConfig, searchForWorkspaceRoot } from "vite";
import { join } from "node:path";
import { readdirSync, realpathSync } from "node:fs";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import { varlockVitePlugin } from "@varlock/vite-integration";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },

  plugins: [
    // Resolved-env: bake validated env into the SSR bundle. Vercel serverless
    // Functions boot without `varlock run`, so init-only would leave env empty.
    // Pair with @encryptInjectedEnv (see .env.schema) + _VARLOCK_ENV_KEY.
    varlockVitePlugin({ ssrInjectMode: "resolved-env" }),

    tanstackStart(),

    nitro({
      preset: process.env.NITRO_PRESET || "vercel",
      devServer: { runner: "node-worker" },
      compatibilityDate: "2026-03-21",
    }),

    react({ compiler: true }),

    tailwindcss(),
  ],
  server: {
    fs: {
      // Nitro loads bundled dev modules through package paths in Bun's shared store.
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        ...readdirSync("node_modules/.bun", { withFileTypes: true })
          .filter(entry => entry.isSymbolicLink())
          .map(entry => realpathSync(join("node_modules/.bun", entry.name))),
      ],
    },
    port: 3000,
  },
});
