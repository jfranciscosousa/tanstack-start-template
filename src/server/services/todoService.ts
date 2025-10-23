import { createServerOnlyFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";

import { AppError } from "~/errors";
import { db } from "../db";
import { todos, type UserWithoutPassword } from "../db/schema";

export const getTodos = createServerOnlyFn(
  async (user: UserWithoutPassword) => {
    const userTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, user.id))
      .orderBy(desc(todos.createdAt));

    return userTodos;
  }
);

export const createTodo = createServerOnlyFn(
  async (user: UserWithoutPassword, content: string) => {
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
  async (user: UserWithoutPassword, todoId: string) => {
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

export const deleteAllTodos = createServerOnlyFn(
  async (user: UserWithoutPassword) => {
    await db.delete(todos).where(eq(todos.userId, user.id));

    return { success: true };
  }
);
