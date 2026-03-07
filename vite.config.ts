import path from "path";

import { checker } from "vite-plugin-checker";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    mode === "development" && checker({ oxlint: true, typescript: true }),

    tanstackStart(),

    nitroV2Plugin({
      preset: process.env.NITRO_PRESET || "vercel",
    }),

    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),

    tailwindcss(),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
}));
