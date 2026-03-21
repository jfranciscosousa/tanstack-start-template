import { checker } from "vite-plugin-checker";
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import babel from "@rolldown/plugin-babel";

export default defineConfig(({ mode }) => ({
  resolve: { tsconfigPaths: true },

  plugins: [
    mode === "development" && checker({ oxlint: true, typescript: true }),

    tanstackStart(),

    nitroV2Plugin({
      preset: process.env.NITRO_PRESET || "vercel",
      compatibilityDate: "2026-03-21",
    }),

    react(),

    babel({ presets: [reactCompilerPreset()] }),

    tailwindcss(),
  ],
  server: {
    port: 3000,
  },
}));
