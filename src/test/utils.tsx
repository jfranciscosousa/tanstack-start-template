import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

// Custom render function for testing React components
// Add providers here as needed (e.g., theme providers, query clients, etc.)
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  return render(ui, {
    // Add wrapper providers here when needed
    // wrapper: ({ children }) => <Provider>{children}</Provider>,
    ...options,
  });
};

export * from "@testing-library/react";
export { customRender as render };
