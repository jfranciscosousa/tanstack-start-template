import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },

  plugins: [
    tanstackStart(),

    nitro({
      preset: process.env.NITRO_PRESET || "vercel",
      compatibilityDate: "2026-03-21",
    }),

    react({ compiler: true }),

    tailwindcss(),
  ],
  server: {
    port: 3000,
  },
});
