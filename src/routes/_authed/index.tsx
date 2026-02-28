import { toast } from "sonner";
import { useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import {
  createTodoFn,
  deleteAllTodosFn,
  deleteTodoFn,
  getTodosFn,
} from "~/server/handlers/todoHandlers";
import { useMutation } from "~/hooks/useMutation";

export const Route = createFileRoute("/_authed/")({
  component: RouteComponent,
  loader: () => getTodosFn(),
});

interface Todo {
  id: string;
  content: string;
  createdAt: Date;
}

interface TodoCardProps {
  todo: Todo;
  onDelete: (id: string) => void;
  disabled: boolean;
}

function TodoCard({ todo, onDelete, disabled }: TodoCardProps) {
  function handleDelete() {
    onDelete(todo.id);
  }

  return (
    <div className="break-inside-avoid">
      <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
        <div className="card-body p-4">
          <p className="whitespace-pre-wrap wrap-break-word">{todo.content}</p>
          <div className="card-actions justify-between items-center mt-3">
            <time className="text-xs text-base-content/50">
              {new Date(todo.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </time>
            <button
              type="button"
              className="btn btn-xs btn-error"
              onClick={handleDelete}
              disabled={disabled}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  const router = useRouter();
  const todos = Route.useLoaderData();
  const inputRef = useRef<HTMLInputElement>(null);
  const createTodoMutation = useMutation({
    fn: useServerFn(createTodoFn),
    onError: () => {
      toast.error("Error while creating todo, try again later");
    },
    onSuccess: async () => {
      await router.invalidate({ sync: true });
    },
  });
  const deleteTodoMutation = useMutation({
    fn: useServerFn(deleteTodoFn),
    onError: () => {
      toast.error("Error while deleting todo, try again later");
    },
    onSuccess: async () => {
      await router.invalidate({ sync: true });
    },
  });
  const deleteAllTodosMutation = useMutation({
    fn: useServerFn(deleteAllTodosFn),
    onError: () => {
      toast.error("Error while deleting todos, try again later");
    },
    onSuccess: async () => {
      await router.invalidate({ sync: true });
      toast.success("All todos were deleted");
    },
  });
  const isSubmitting =
    createTodoMutation.status === "pending" ||
    deleteAllTodosMutation.status === "pending";

  function handleCreateTodo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const content = formData.get("content") as string;

    if (!content.trim()) {
      return;
    }

    createTodoMutation
      .mutateAsync({ data: { content } })
      .then(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.value = "";
        }
      })
      // TODO: error handle
      // eslint-disable-next-line no-console
      .catch(console.error);
  }

  function handleDeleteTodo(id: string) {
    deleteTodoMutation.mutate({ data: { id } });
  }

  function handleDeleteAllTodos() {
    deleteAllTodosMutation.mutate({});
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Todos</h1>

      <div className="flex flex-row justify-between items-center mb-8">
        <form onSubmit={handleCreateTodo} className=" max-w-2xl w-full">
          <div className="flex gap-2">
            <input
              name="content"
              ref={inputRef}
              type="text"
              className="input input-bordered flex-1"
              placeholder="What needs to be done?"
              disabled={isSubmitting}
              required
              autoComplete="off"
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

        <button
          className="btn btn-error"
          type="button"
          onClick={handleDeleteAllTodos}
          disabled={isSubmitting}
        >
          Delete all
        </button>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {todos.map(todo => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onDelete={handleDeleteTodo}
            disabled={deleteTodoMutation.status === "pending"}
          />
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
