import { z } from "zod";

export const createTodoSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export const deleteTodoSchema = z.object({ id: z.string() });
