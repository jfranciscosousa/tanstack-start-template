import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "~/errors";
import { useLoggedInAppSession } from "./websession";
import { db } from "./db";
import { todos } from "./db/schema";
import { eq, and, desc } from "drizzle-orm";

const createTodoSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export const getTodos = createServerFn({ method: "GET" }).handler(async () => {
  const { user } = await useLoggedInAppSession();

  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, user.id))
    .orderBy(desc(todos.createdAt));

  return userTodos;
});

export const createTodo = createServerFn({ method: "POST" })
  .inputValidator(createTodoSchema)
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession();

    const [todo] = await db
      .insert(todos)
      .values({
        content: data.content,
        userId: user.id,
      })
      .returning();

    return todo;
  });

export const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession();

    const [todo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, data.id), eq(todos.userId, user.id)))
      .limit(1);

    if (!todo) {
      throw new AppError("NOT_FOUND");
    }

    await db.delete(todos).where(eq(todos.id, data.id));

    return { success: true };
  });

export const deleteAllTodos = createServerFn({
  method: "POST",
}).handler(async () => {
  const { user } = await useLoggedInAppSession();

  await db.delete(todos).where(eq(todos.userId, user.id));

  return { success: true };
});
