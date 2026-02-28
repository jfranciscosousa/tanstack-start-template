# Testing

**Unit:** Vitest | **E2E:** Playwright (Chromium only) | **Helpers:** Testing Library, Faker

## Commands

```bash
bin/test                                     # All tests
bin/test-vitest                              # Unit tests
bin/test-vitest-watch                        # Unit tests watch
bin/test-e2e                                 # E2E tests
bin/test-vitest path/to/file.test.ts         # Single unit test file
```

## Test Environments

| File suffix | Environment | Use for |
|---|---|---|
| `*.test.ts` / `*.test.tsx` | jsdom | Components, hooks, browser behavior |
| `*.node.test.ts` | Node | Server functions, services, handlers |

## Component Test (jsdom)

```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '../../../test/utils';
import { MyComponent } from '../MyComponent';

test('renders label', () => {
  render(<MyComponent label="Hello" />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

Use `~/test/utils` (not `@testing-library/react` directly) — it wraps with necessary providers.

## Server/Handler Test (node)

```typescript
// src/server/__tests__/myHandler.node.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { createTestUser } from '../../test/node-utils';

describe('myHandler', () => {
  beforeEach(async () => { /* reset test DB state */ });

  test('creates record', async () => {
    const user = await createTestUser();
    // call handler, assert result
  });
});
```

Use `~/test/node-utils` for server-side test helpers. Use `@faker-js/faker` for generating test data.

## E2E Test (Playwright)

```typescript
// src/test/e2e/feature.test.ts
import { test, expect } from '@playwright/test';
import { loginAs } from './utils';

test('user can do thing', async ({ page }) => {
  await loginAs(page, 'user@example.com', 'password');
  await page.goto('/');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

Use `~/test/e2e/utils` for shared helpers like `loginAs`. E2E tests run against a local server on port 3001.

## Test Files Location

Co-locate tests with source files in a `__tests__/` subdirectory:

```
src/components/__tests__/TextInput.test.tsx
src/server/__tests__/userHandlers.node.test.ts
src/test/e2e/authentication.test.ts
```
