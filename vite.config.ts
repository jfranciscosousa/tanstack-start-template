import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  resolve: { tsconfigPaths: true },

  plugins: [
    tanstackStart(),

    nitro({
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
});
