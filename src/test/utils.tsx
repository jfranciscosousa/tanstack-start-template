import type { ReactElement } from "react";
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';

// Custom render function for testing React components
// Add providers here as needed (e.g., theme providers, query clients, etc.)
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    // Add wrapper providers here when needed
    // Wrapper: ({ children }) => <Provider>{children}</Provider>,
    ...options,
  });
}

// eslint-disable-next-line import/export -- re-exporting testing-library utilities
export * from "@testing-library/react";
export { customRender as render };
