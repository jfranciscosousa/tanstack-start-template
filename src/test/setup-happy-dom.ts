import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
// eslint-disable-next-line import/no-unassigned-import -- side-effect import for jest-dom matchers
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});
