import { createServerFn } from "@tanstack/react-start";

import { createTodoSchema, deleteTodoSchema } from "~/schemas/todo-schemas";

import {
  createTodo,
  deleteAllTodos,
  deleteTodo,
  getTodos,
} from "../services/todo-service";
import { useLoggedInAppSession } from "../web-session";

export const getTodosFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const { user } = await useLoggedInAppSession();

    return getTodos(user);
  },
);

export const createTodoFn = createServerFn({ method: "POST" })
  .inputValidator(createTodoSchema)
  .handler(async ({ data }) => {
    const { user } = await useLoggedInAppSession();

    return createTodo(user, data.content);
  });

export const deleteTodoFn = createServerFn({ method: "POST" })
  .inputValidator(deleteTodoSchema)
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
