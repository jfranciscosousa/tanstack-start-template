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
          include: ["**/*.test.{ts,js,tsx,jsx}"],
          exclude: [
            "**/node_modules/**",
            "**/*.node.test.{ts,js}",
            "./src/test/e2e",
          ],
          name: "jsdom",
          environment: "jsdom",
          setupFiles: "./src/test/setup-jsdom.ts",
        },
      },
      {
        extends: true,
        test: {
          include: ["**/*.node.test.{ts,js}"],
          exclude: ["**/node_modules/**", "./src/test/e2e"],
          name: { label: "node", color: "green" },
          environment: "node",
          setupFiles: "./src/test/setup-node.ts",
        },
      },
    ],
  },
});
