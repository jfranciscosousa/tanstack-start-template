import { defineConfig } from "vitest/config";
import path from "path";

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
          environment: "happy-dom",
          exclude: [
            "**/node_modules/**",
            "**/*.server.test.{ts,js}",
            "./src/test/e2e",
          ],
          include: ["**/*.test.{ts,js,tsx,jsx}"],
          name: "happy-dom",
          setupFiles: "./src/test/setup-happy-dom.ts",
        },
      },
      {
        extends: true,
        test: {
          environment: "node",
          exclude: ["**/node_modules/**", "./src/test/e2e"],
          include: ["**/*.server.test.{ts,js}"],
          name: { color: "green", label: "server" },
          setupFiles: "./src/test/setup-server.ts",
        },
      },
    ],
  },
});
