# Testing

**Unit:** Vitest | **E2E:** Playwright (Chromium only) | **Helpers:** Testing Library, Faker

Do not test what typescript already guarantees

## Commands

```bash
bin/test                                     # All tests
bin/test-vitest                              # Unit tests
bin/test-vitest-watch                        # Unit tests watch
bin/test-e2e                                 # E2E tests
bin/test-vitest path/to/file.test.ts         # Single unit test file
```

## Test Environments

| File suffix                  | Environment | Use for                              |
| ---------------------------- | ----------- | ------------------------------------ |
| `*.test.ts` / `*.test.tsx`   | happy-dom   | Components, hooks, browser behavior  |
| `*.server.test.ts`           | Node        | Server functions, services, handlers |

## Component Test (happy-dom)

```typescript
// src/components/MyComponent.test.tsx
import { render, screen } from '~/test/utils';
import { MyComponent } from './MyComponent';

test('renders label', () => {
  render(<MyComponent label="Hello" />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

Use `~/test/utils` (not `@testing-library/react` directly) — it wraps with necessary providers.

## Server/Handler Test (node)

```typescript
// src/server/services/my-service.server.test.ts
import { describe, test, expect, beforeEach } from "vitest";
import { createTestUser } from "~/test/server-utils";

describe("myService", () => {
  test("creates record", async () => {
    const user = await createTestUser();
    // call service/handler, assert result
  });
});
```

Use `~/test/server-utils` for server-side test helpers (`createTestUser`, `mockLoggedIn`, `mockLoggedOut`). Use `@faker-js/faker` for generating test data.

## E2E Test (Playwright)

```typescript
// src/test/e2e/feature.test.ts
import { test, expect } from "@playwright/test";
import { loginAs } from "./utils";

test("user can do thing", async ({ page }) => {
  await loginAs(page, "user@example.com", "password");
  await page.goto("/");
  await expect(page.getByRole("heading")).toBeVisible();
});
```

Use `~/test/e2e/utils` for shared helpers like `loginAs`. E2E tests run against a local server on port 3001.

## Test Files Location

Co-locate tests next to their implementation files:

```
src/components/MyComponent.test.tsx
src/server/services/my-service.server.test.ts
src/test/e2e/authentication.test.ts
```
