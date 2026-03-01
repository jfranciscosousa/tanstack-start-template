# Architecture & Patterns

## Layered Architecture (STRICT)

```
db/ → services/ → handlers/ → routes/
 ↓         ↓           ↓          ↓
Schema   Pure fns   Server fns  React UI
only     no HTTP    + validation
```

**Rules:**
- `db/schema.ts` — schema definitions only, no queries
- `services/` — Drizzle queries, pure business logic, use `createServerOnlyFn`
- `handlers/` — `createServerFn` + `.inputValidator()` + Zod, delegates to services
- `routes/` — thin shells: route config, loader, and `validateSearch` only
- `domains/` — all page UI and sub-components, grouped by feature

Never put DB queries in handlers. Never put HTTP/session logic in services. Never put UI logic in route files.

## File Organization

```
src/
├── routes/
│   ├── __root.tsx              # Root layout; loads user via fetchCurrentUser()
│   ├── _authed.tsx             # Protected layout; redirects if !context.user
│   ├── _authed/
│   │   ├── index.tsx           # Todo dashboard (thin route shell)
│   │   └── profile.tsx         # Profile route (thin route shell)
│   ├── _unauthed/
│   │   ├── login.tsx           # Login route (thin route shell)
│   │   └── signup.tsx          # Signup route (thin route shell)
│   └── logout.tsx
├── domains/                    # Feature UI — grouped by domain
│   ├── login/
│   │   └── login-page.tsx      # Full login page component
│   ├── signup/
│   │   └── signup-page.tsx     # Full signup page component
│   └── profile/
│       ├── profile-page.tsx    # Profile page component (renders tabs)
│       ├── profile-tab.tsx     # Profile info & password form
│       └── sessions-tab.tsx    # Active sessions management
├── server/
│   ├── db/index.ts             # Drizzle client
│   ├── db/schema.ts            # Tables + relations
│   ├── services/               # user-services, session-service, password-service, todo-service
│   ├── handlers/               # user-handlers, session-handlers, todo-handlers
│   ├── web-session.ts          # useWebSession(), useLoggedInAppSession()
│   ├── request-info.ts         # IP/geo/user-agent extraction
│   └── seo.ts
├── components/                 # Shared reusable React components
│   └── ui/                     # Base UI primitives (button, input, etc.)
├── hooks/
│   ├── use-mutation.ts         # Async mutation with loading/error state
│   └── use-form-data-validator.ts
├── middlewares/logging.ts
├── errors.ts                   # AppError class
└── styles/app.css
```

Use `~/` absolute imports everywhere (maps to `src/`).

## Domain Pattern

Route files are thin shells — they only define the route config, loader, and search params. All UI lives in `src/domains/<feature>/`.

**Route file** (`src/routes/_unauthed/login.tsx`):
```typescript
import z from 'zod';
import { createFileRoute } from '@tanstack/react-router';
import LoginPage from '~/domains/login/login-page';

const searchSchema = z.object({ redirectUrl: z.string().optional() });

export const Route = createFileRoute('/_unauthed/login')({
  component: LoginPage,
  validateSearch: (search) => searchSchema.parse(search),
});
```

**Domain page** (`src/domains/login/login-page.tsx`):
```typescript
import { Route } from '~/routes/_unauthed/login'; // import Route for useSearch/useLoaderData

export default function LoginPage() {
  const { redirectUrl } = Route.useSearch();
  // ... full component
}
```

Domain sub-components (tabs, cards, sections) live alongside the page in the same domain folder. No `-` prefix needed — the `domains/` folder itself scopes them.

## Server Function Pattern

```typescript
import { createServerFn } from '@tanstack/react-start';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { useLoggedInAppSession } from '~/server/web-session';
import { updateUser } from '~/server/services/user-services';
import { AppError } from '~/errors';

const schema = zfd.formData({
  name: zfd.text(z.string().min(1)),
  email: zfd.text(z.string().email()),
});

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator((formData: FormData) => schema.parse(formData))
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession(); // throws if not authed
    return await updateUser(user.id, data);
  });
```

Note: `.inputValidator()` not `.validator()`. Always use `zfd.formData` for FormData inputs.

## Service Layer Pattern

```typescript
import { createServerOnlyFn } from '@tanstack/react-start';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';

export const createUser = createServerOnlyFn(
  async (data: { name: string; email: string; password: string }) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }
);
```

## Route with Loader + Mutation

```typescript
export const Route = createFileRoute('/_authed/')({
  loader: async () => await fetchTodosFn(),
  component: TodoPage,
});

function TodoPage() {
  const todos = Route.useLoaderData();
  const router = useRouter();

  const mutation = useMutation({
    fn: useServerFn(createTodoFn),   // useServerFn is a hook — use inside component
    onSuccess: async () => {
      await router.invalidate({ sync: true }); // refetch loader data
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ data: new FormData(e.currentTarget) });
  };
}
```

## Route Protection

```typescript
// _authed.tsx
export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' });
    }
  },
});
```

## Session Utilities

```typescript
// Public routes — user may be null
const { user, session } = await useWebSession();

// Protected handlers — throws AppError('UNAUTHENTICATED') if no session
const { user, session } = await useLoggedInAppSession();
```

## Error Handling

```typescript
import { AppError, renderError } from '~/errors';

// In handlers/services
throw new AppError('NOT_FOUND', 'Todo not found');
throw new AppError('UNAUTHENTICATED');
throw new AppError('FORBIDDEN', 'Cannot edit another user\'s todo');

// In components
const message = renderError(error); // → string
```

## File Naming

All files use hyphen-case. Exceptions: TanStack Router conventions (`__root.tsx`, `_authed.tsx`, `_unauthed.tsx`).

| Location | Contains |
|---|---|
| `routes/*.tsx` | Thin route shell (config + loader + validateSearch only) |
| `domains/<feature>/` | Page components and feature-scoped sub-components |
| `components/` | Shared components used across multiple domains |
| `server/services/` | Pure business logic, Drizzle queries |
| `server/handlers/` | Server functions with input validation |

## PR Checklist

- [ ] `bin/ts-check` passes on changed files
- [ ] `bin/lint` and `bin/format` clean
- [ ] Layered architecture respected (no DB in handlers, no HTTP in services)
- [ ] Route files are thin shells — UI lives in `domains/`
- [ ] All server functions use `.inputValidator()` with Zod schema
- [ ] No sensitive data in error messages
- [ ] Passwords hashed with `bcrypt-ts` — never plain-text
