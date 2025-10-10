import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import { fixupConfigRules } from "@eslint/compat";

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...fixupConfigRules(react.configs.flat.recommended),
  ...fixupConfigRules(react.configs.flat["jsx-runtime"]),
  jsxA11y.flatConfigs.recommended,
  prettierConfig,
  {
    plugins: {
      "react-hooks": reactHooks,
      prettier,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/only-throw-error": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    ignores: [
      "dist/**",
      "build/**",
      ".vinxi/**",
      ".output/**",
      "node_modules/**",
      "coverage/**",
      "*.config.js",
      "*.config.ts",
      "vite.config.ts",
      "routeTree.gen.ts",
      "**/public/**",
      "*.min.js",
      "*.min.css",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
    ],
  },
]);
