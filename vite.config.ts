import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import checker from "vite-plugin-checker";
import react from "@vitejs/plugin-react";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import path from "path";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  plugins: [
    mode === "serve" &&
      checker({ typescript: true /** or an object config */ }),

    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),

    tanstackStart(),

    nitroV2Plugin({
      preset: process.env.NITRO_PRESET || "vercel",
    }),

    react(),

    tailwindcss(),
  ],
}));
