# Database

**ORM:** Drizzle ORM | **DB:** PostgreSQL via `postgres-js` | **Schema:** [src/server/db/schema.ts](../../src/server/db/schema.ts)

## Schema

```
users      id·uuid·PK  name·text  email·text·UNIQUE  password·text(bcrypt)  createdAt  updatedAt
sessions   id·uuid·PK  userId·FK→users(CASCADE)  ipAddress  userAgent  location  createdAt  updatedAt
todos      id·uuid·PK  userId·FK→users(CASCADE)  content·text  createdAt
```

Sessions and todos both have index on `userId`.

**Exported types:** `User`, `UserWithoutPassword`, `NewUser`, `Session`, `NewSession`, `Todo`, `NewTodo`

## Drizzle Patterns

```typescript
import { db } from '~/server/db';
import { users, todos } from '~/server/db/schema';
import { eq, and } from 'drizzle-orm';

// Select
const user = await db.query.users.findFirst({ where: eq(users.email, email) });

// Select with relations
const userWithSessions = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: { sessions: true },
});

// Insert
const [newUser] = await db.insert(users).values({ name, email, password }).returning();

// Update
await db.update(users).set({ name }).where(eq(users.id, userId));

// Delete
await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));
```

Never use raw SQL. Always use the Drizzle query builder.

## Migrations

```bash
# 1. Edit src/server/db/schema.ts
# 2. Generate migration file
bin/db generate

# 3. Review the generated SQL in drizzle/ before applying — never skip this
# 4. Apply
bin/db migrate

# Dev shortcut (no migration file, direct push)
bin/db push

# Visual UI
bin/db studio
```

**Never auto-apply migrations** without reviewing the generated SQL.

## Environment

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
SECRET_KEY_BASE="minimum-32-character-key"
```

Copy `.env.sample` → `.env` and `.env.test.sample` → `.env.test`. Never commit these files.
