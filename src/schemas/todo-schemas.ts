import { z } from "zod";

export const createTodoSchema = z.object({
  content: z.string().min(1, "Content is required").max(10000),
});

export const deleteTodoSchema = z.object({ id: z.uuid() });
