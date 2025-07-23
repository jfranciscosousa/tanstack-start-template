import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import checker from "vite-plugin-checker";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    checker({ typescript: true /** or an object config */ }),

    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),

    tanstackStart(),

    tailwindcss(),
  ],
});
