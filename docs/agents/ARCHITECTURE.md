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

Use `~/` absolute imports everywhere (maps to `src/`).

## Domain Pattern

Route files are thin shells — they only define the route config, loader, and search params. All UI lives in `src/domains/<feature>/`.

Domain sub-components (tabs, cards, sections) live alongside the page in the same domain folder.

## Server Function Pattern

```typescript
const schema = zfd.formData({
  name: zfd.text(z.string().min(1)),
  email: zfd.text(z.string().email()),
});

export const updateProfileFn = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData) => schema.parse(formData))
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession(); // throws if not authed
    return await updateUser(user.id, data);
  });
```

## Service Layer Pattern

```typescript
import { createServerOnlyFn } from "@tanstack/react-start";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export const createUser = createServerOnlyFn(
  async (data: { name: string; email: string; password: string }) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }
);
```

## Route with Loader + Mutation

```typescript
export const Route = createFileRoute("/_authed/")({
  loader: async () => await fetchTodosFn(),
  component: TodoPage,
});

function TodoPage() {
  const todos = Route.useLoaderData();
  const router = useRouter();

  const mutation = useMutation({
    fn: useServerFn(createTodoFn), // useServerFn is a hook — use inside component
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
export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" });
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
import { AppError, renderError } from "~/errors";

// In handlers/services
throw new AppError("NOT_FOUND", "Todo not found");
throw new AppError("UNAUTHENTICATED");
throw new AppError("FORBIDDEN", "Cannot edit another user's todo");

// In components
const message = renderError(error); // → string
```

## File Naming

All files use hyphen-case. Exceptions: TanStack Router conventions (`__root.tsx`, `_authed.tsx`, `_unauthed.tsx`).
