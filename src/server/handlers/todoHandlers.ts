import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createTodo,
  deleteAllTodos,
  deleteTodo,
  getTodos,
} from "../services/todoService";
import { useLoggedInAppSession } from "../websession";

const createTodoSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export const getTodosFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const { user } = await useLoggedInAppSession();

    return getTodos(user);
  }
);

export const createTodoFn = createServerFn({ method: "POST" })
  .inputValidator(createTodoSchema)
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession();

    return createTodo(user, data.content);
  });

export const deleteTodoFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession();

    return deleteTodo(user, data.id);
  });

export const deleteAllTodosFn = createServerFn({
  method: "POST",
}).handler(async () => {
  const { user } = await useLoggedInAppSession();

  return deleteAllTodos(user);
});
