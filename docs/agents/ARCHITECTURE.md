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
- `routes/` — loaders call handlers, components call handlers via `useServerFn`

Never put DB queries in handlers. Never put HTTP/session logic in services.

## File Organization

```
src/
├── routes/
│   ├── __root.tsx          # Root layout; loads user via fetchCurrentUser()
│   ├── _authed.tsx         # Protected layout; redirects if !context.user
│   ├── _authed/            # Authenticated pages
│   │   ├── index.tsx       # Todo dashboard
│   │   ├── profile.tsx     # Profile page
│   │   └── profile/
│   │       ├── -ProfileTab.tsx    # Private sub-component (- prefix)
│   │       └── -SessionsTab.tsx
│   ├── login.tsx / signup.tsx / logout.tsx
├── server/
│   ├── db/index.ts         # Drizzle client
│   ├── db/schema.ts        # Tables + relations
│   ├── services/           # userServices, sessionService, passwordService, todoService
│   ├── handlers/           # userHandlers, sessionHandlers, todoHandlers
│   ├── websession.ts       # useWebSession(), useLoggedInAppSession()
│   ├── request-info.ts     # IP/geo/user-agent extraction
│   └── seo.ts
├── components/             # Reusable React components
├── hooks/
│   ├── useMutation.ts      # Async mutation with loading/error state
│   └── useFormDataValidator.ts
├── middlewares/logging.ts
├── errors.ts               # AppError class
└── styles/app.css
```

Use `~/` absolute imports everywhere (maps to `src/`).

## Server Function Pattern

```typescript
import { createServerFn } from '@tanstack/react-start';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { useLoggedInAppSession } from '~/server/websession';
import { updateUser } from '~/server/services/userServices';
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

| Pattern | Meaning |
|---|---|
| `_authed/*.tsx` | Protected route |
| `-ComponentName.tsx` | Private sub-component (not a route) |
| `*Services.ts` | Service layer |
| `*Handlers.ts` | Handler layer |

## PR Checklist

- [ ] `bin/ts-check` passes on changed files
- [ ] `bin/lint` and `bin/format` clean
- [ ] Layered architecture respected (no DB in handlers, no HTTP in services)
- [ ] All server functions use `.inputValidator()` with Zod schema
- [ ] No sensitive data in error messages
- [ ] Passwords hashed with `bcrypt-ts` — never plain-text
