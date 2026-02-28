import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },

  test: {
    clearMocks: true,

    projects: [
      {
        extends: true,
        test: {
          environment: "jsdom",
          exclude: [
            "**/node_modules/**",
            "**/*.node.test.{ts,js}",
            "./src/test/e2e",
          ],
          include: ["**/*.test.{ts,js,tsx,jsx}"],
          name: "jsdom",
          setupFiles: "./src/test/setup-jsdom.ts",
        },
      },
      {
        extends: true,
        test: {
          environment: "node",
          exclude: ["**/node_modules/**", "./src/test/e2e"],
          include: ["**/*.node.test.{ts,js}"],
          name: { color: "green", label: "node" },
          setupFiles: "./src/test/setup-node.ts",
        },
      },
    ],
  },
});
