import { and, desc, eq } from "drizzle-orm";
import type { User } from "better-auth";
import { createServerOnlyFn } from "@tanstack/react-start";

import { AppError } from "~/errors";

import { todos } from "../db/schema";
import { db } from "../db";

export const getTodos = createServerOnlyFn(async (user: User) => {
  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, user.id))
    .orderBy(desc(todos.createdAt));

  return userTodos;
});

export const createTodo = createServerOnlyFn(
  async (user: User, content: string) => {
    const [todo] = await db
      .insert(todos)
      .values({
        content,
        userId: user.id,
      })
      .returning();

    return todo;
  }
);

export const deleteTodo = createServerOnlyFn(
  async (user: User, todoId: string) => {
    const todo = await db
      .delete(todos)
      .where(and(eq(todos.id, todoId), eq(todos.userId, user.id)))
      .returning();

    if (!todo) {
      throw new AppError("NOT_FOUND");
    }

    return { success: true };
  }
);

export const deleteAllTodos = createServerOnlyFn(async (user: User) => {
  await db.delete(todos).where(eq(todos.userId, user.id));

  return { success: true };
});
