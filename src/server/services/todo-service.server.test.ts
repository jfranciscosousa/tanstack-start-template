import { beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

import type { UserWithoutPassword } from "~/server/db/schema";
import { todos } from "../db/schema";
import { db } from "../db";
import { createTestUser } from "~/test/server-utils";
import {
  createTodo,
  deleteAllTodos,
  deleteTodo,
  getTodos,
} from "./todo-service";

describe("Todo service", () => {
  let testUser: UserWithoutPassword;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe("getTodos", () => {
    it("should return empty array when user has no todos", async () => {
      const result = await getTodos(testUser);

      expect(result).toEqual([]);
    });

    it("should return todos for the user ordered by createdAt desc", async () => {
      await db.insert(todos).values([
        { content: "First todo", userId: testUser.id },
        { content: "Second todo", userId: testUser.id },
      ]);

      const result = await getTodos(testUser);

      expect(result).toHaveLength(2);
      expect(result[0].createdAt >= result[1].createdAt).toBe(true);
    });

    it("should only return todos belonging to the requesting user", async () => {
      const otherUser = await createTestUser();

      await db.insert(todos).values([
        { content: "My todo", userId: testUser.id },
        { content: "Other user's todo", userId: otherUser.id },
      ]);

      const result = await getTodos(testUser);

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe("My todo");
    });
  });

  describe("createTodo", () => {
    it("should create a todo and return it", async () => {
      const content = faker.lorem.sentence();

      const todo = await createTodo(testUser, content);

      expect(todo.content).toBe(content);
      expect(todo.userId).toBe(testUser.id);
    });

    it("should persist the todo in the database", async () => {
      const content = faker.lorem.sentence();

      const todo = await createTodo(testUser, content);

      const fromDb = await db.query.todos.findFirst({
        where: eq(todos.id, todo.id),
      });

      if (!fromDb) throw new Error("fromDb should exist");
      expect(fromDb.content).toBe(content);
      expect(fromDb.userId).toBe(testUser.id);
    });
  });

  describe("deleteTodo", () => {
    it("should delete a todo and return success", async () => {
      const [todo] = await db
        .insert(todos)
        .values({ content: "To delete", userId: testUser.id })
        .returning();

      const result = await deleteTodo(testUser, todo.id);

      expect(result).toEqual({ success: true });

      const fromDb = await db.query.todos.findFirst({
        where: eq(todos.id, todo.id),
      });

      expect(fromDb).toBeUndefined();
    });

    it("should not delete a todo belonging to another user", async () => {
      const otherUser = await createTestUser();
      const [otherTodo] = await db
        .insert(todos)
        .values({ content: "Other's todo", userId: otherUser.id })
        .returning();

      await deleteTodo(testUser, otherTodo.id);

      const fromDb = await db.query.todos.findFirst({
        where: eq(todos.id, otherTodo.id),
      });

      expect(fromDb).toBeDefined();
    });
  });

  describe("deleteAllTodos", () => {
    it("should delete all todos for the user and return success", async () => {
      await db.insert(todos).values([
        { content: "Todo 1", userId: testUser.id },
        { content: "Todo 2", userId: testUser.id },
        { content: "Todo 3", userId: testUser.id },
      ]);

      const result = await deleteAllTodos(testUser);

      expect(result).toEqual({ success: true });

      const remaining = await getTodos(testUser);

      expect(remaining).toHaveLength(0);
    });

    it("should only delete todos for the requesting user", async () => {
      const otherUser = await createTestUser();

      await db.insert(todos).values([
        { content: "My todo", userId: testUser.id },
        { content: "Other's todo", userId: otherUser.id },
      ]);

      await deleteAllTodos(testUser);

      const otherUserTodos = await db
        .select()
        .from(todos)
        .where(eq(todos.userId, otherUser.id));

      expect(otherUserTodos).toHaveLength(1);
      expect(otherUserTodos[0].content).toBe("Other's todo");
    });
  });
});
