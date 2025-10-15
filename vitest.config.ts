import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }) as any,
  ],
  test: {
    clearMocks: true,

    projects: [
      {
        // add "extends: true" to inherit the options from the root config
        extends: true,
        test: {
          include: ["**/*.test.{ts,js,tsx,jsx}"],
          exclude: ["**/node_modules/**", "**/*.node.test.{ts,js}", "./src/test/e2e"],
          // it is recommended to define a name when using inline configs
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
          // color of the name label can be changed
          name: { label: "node", color: "green" },
          environment: "node",
          setupFiles: "./src/test/setup-node.ts",
        },
      },
    ],
  },
});
