import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "warn",
    nursery: "warn",
    pedantic: "warn",
    perf: "error",
    restriction: "error",
    style: "warn",
    suspicious: "error",
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx"],
      rules: {
        "init-declarations": "off",
      },
    },
  ],
  plugins: ["react", "react-perf"],
  rules: {
    complexity: "off",
    "eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "func-style": ["error", "declaration"],
    "id-length": ["warn", { exceptions: ["T", "z"] }],
    "jsx-max-depth": "off",
    "jsx-no-jsx-as-prop": "off",
    "jsx-no-new-array-as-prop": "off",
    "jsx-no-new-function-as-prop": "off",
    "jsx-no-new-object-as-prop": "off",
    "max-lines": "off",
    "max-lines-per-function": "off",
    "max-statements": "off",
    "no-magic-numbers": "off",
    "no-nested-ternary": "error",
    "no-ternary": "off",
    "no-undefined": "off",
    "no-use-before-define": "off",
    "no-void": "off",
    "no-warning-comments": "off",
    "react/jsx-filename-extension": ["warn", { extensions: [".jsx", ".tsx"] }],
    "react/jsx-props-no-spreading": "off",
    "react/no-multi-comp": "off",
    "react/only-export-components": "off",
    "react/react-in-jsx-scope": "off",
    "sort-imports": "off",
    "sort-keys": "off",
  },
});
