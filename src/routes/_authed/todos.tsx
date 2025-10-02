import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getTodos,
  createTodo as createTodoFn,
  deleteTodo,
} from "~/server/todos";
import { useState, useRef, useLayoutEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { flushSync } from "react-dom";

export const Route = createFileRoute("/_authed/todos")({
  component: RouteComponent,
  loader: () => getTodos(),
});

function RouteComponent() {
  const router = useRouter();
  const todos = Route.useLoaderData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const createTodo = useServerFn(createTodoFn);

  const handleCreateTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await createTodo({ data: { content } });
      await router.invalidate({ sync: true });
    } catch (error) {
      console.error("Failed to create todo:", error);
    } finally {
      // Otherwise, programatic focus doesn't work
      flushSync(() => {
        setIsSubmitting(false);
      });
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo({ data: { id } });
      await router.invalidate();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Todos</h1>

      <form onSubmit={handleCreateTodo} className="mb-8 max-w-2xl">
        <div className="flex gap-2">
          <input
            name="content"
            ref={inputRef}
            type="text"
            className="input input-bordered flex-1"
            placeholder="What needs to be done?"
            disabled={isSubmitting}
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            Add
          </button>
        </div>
      </form>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {todos.map((todo) => (
          <div key={todo.id} className="break-inside-avoid">
            <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body p-4">
                <p className="whitespace-pre-wrap break-words">
                  {todo.content}
                </p>
                <div className="card-actions justify-between items-center mt-3">
                  <time className="text-xs text-base-content/50">
                    {new Date(todo.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                  <button
                    className="btn btn-xs btn-ghost btn-error"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {todos.length === 0 && (
        <div className="text-center py-12 text-base-content/60">
          <p className="text-lg">No todos yet. Create your first one above!</p>
        </div>
      )}
    </div>
  );
}
