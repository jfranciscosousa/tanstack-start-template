import { defineConfig } from "deepsec/config";

import { generatedMatchersPlugin } from "./generated-matchers.js";

export default defineConfig({
  defaultModel: "gpt-5.6-sol",
  defaultAgent: "pi",
  defaultThinkingLevel: "medium",
  projects: [{ id: "tanstack-start-template", root: ".." }],
  plugins: [generatedMatchersPlugin],
});
