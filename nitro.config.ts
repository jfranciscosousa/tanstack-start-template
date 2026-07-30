import { defineConfig } from "nitro";
import evlog from "evlog/nitro/v3";

export default defineConfig({
  plugins: ["./src/evlog/evlog-enrich.ts"],
  experimental: {
    asyncContext: true,
  },
  modules: [
    evlog({
      env: { service: "tanstack-start-template" },
      sampling: {
        rates: { info: 50, warn: 100, error: 100 },
      },
    }),
  ],
});
