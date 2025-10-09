import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AppError } from "~/errors";
import { useLoggedInAppSession } from "./websession";
import { prismaClient } from "./prisma";

const createTodoSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export const getTodos = createServerFn({ method: "GET" }).handler(async () => {
  const { user } = await useLoggedInAppSession();

  const todos = await prismaClient.todo.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return todos;
});

export const createTodo = createServerFn({ method: "POST" })
  .inputValidator(createTodoSchema)
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession();

    const todo = await prismaClient.todo.create({
      data: {
        content: data.content,
        userId: user.id,
      },
    });

    return todo;
  });

export const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession();

    const todo = await prismaClient.todo.findUnique({
      where: { id: data.id, userId: user.id },
    });

    if (!todo) {
      throw new AppError("NOT_FOUND");
    }

    await prismaClient.todo.delete({
      where: { id: data.id },
    });

    return { success: true };
  });

export const deleteAllTodos = createServerFn({
  method: "POST",
}).handler(async () => {
  const { user } = await useLoggedInAppSession();

  await prismaClient.todo.deleteMany({ where: { userId: user.id } });

  return { success: true };
});
