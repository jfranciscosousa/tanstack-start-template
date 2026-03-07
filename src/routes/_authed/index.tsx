import { toast } from "sonner";
import { useRef } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import {
  createTodoFn,
  deleteAllTodosFn,
  deleteTodoFn,
  getTodosFn,
} from "~/server/handlers/todo-handlers";
import { useMutation } from "~/hooks/use-mutation";
import { Input } from "~/components/ui/input";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

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
    <div className="group break-inside-avoid">
      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm ring-foreground/5 ring-1 transition-all duration-200 hover:border-primary/40 hover:shadow-primary/5 hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-foreground/90">
              {todo.content}
            </p>
            <time className="mt-2.5 block font-mono text-[11px] tracking-wide text-muted-foreground/60 uppercase">
              {new Date(todo.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleDelete}
            disabled={disabled}
            aria-label="Delete task"
            className="mt-0.5 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={13} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const deleteAllTrigger = (
  <Button
    variant="ghost"
    size="sm"
    className="gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
  >
    <Trash2 size={13} aria-hidden="true" />
    Clear all
  </Button>
);

const cancelButton = (
  <Button variant="outline" size="sm">
    Cancel
  </Button>
);

interface DeleteAllDialogProps {
  count: number;
  onConfirm: () => void;
  isLoading: boolean;
}

function DeleteAllDialog({
  count,
  onConfirm,
  isLoading,
}: DeleteAllDialogProps) {
  return (
    <DialogRoot>
      <DialogTrigger render={deleteAllTrigger} />
      <DialogContent>
        <DialogTitle>Clear all tasks?</DialogTitle>
        <DialogDescription>
          This will permanently delete all {count}{" "}
          {count === 1 ? "task" : "tasks"}. This cannot be undone.
        </DialogDescription>
        <div className="mt-6 flex justify-end gap-3">
          <DialogClose render={cancelButton} />
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 size={14} aria-hidden="true" />
            )}
            Clear all
          </Button>
        </div>
      </DialogContent>
    </DialogRoot>
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
      toast.success("All tasks cleared");
    },
  });

  const isCreating = createTodoMutation.status === "pending";

  function handleCreateTodo(event: React.SyntheticEvent<HTMLFormElement>) {
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
    <div className="container mx-auto max-w-5xl px-5 py-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold italic tracking-tight text-foreground">
            My Tasks
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {todos.length === 0
              ? "Nothing on the list — enjoy your day"
              : `${todos.length} ${todos.length === 1 ? "task" : "tasks"} waiting`}
          </p>
        </div>
        {todos.length > 0 && (
          <DeleteAllDialog
            count={todos.length}
            onConfirm={handleDeleteAllTodos}
            isLoading={deleteAllTodosMutation.status === "pending"}
          />
        )}
      </div>

      {/* Create form */}
      <form onSubmit={handleCreateTodo} className="mb-10">
        <label htmlFor="todo-content" className="sr-only">
          New task
        </label>
        <div className="flex overflow-hidden rounded-lg border border-border bg-card shadow-sm ring-1 ring-foreground/5 transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
          <Input
            id="todo-content"
            name="content"
            ref={inputRef}
            type="text"
            className="flex-1 rounded-none border-0 bg-transparent shadow-none outline-none ring-0 focus-visible:ring-0 focus-visible:border-0 text-sm placeholder:text-muted-foreground/50"
            placeholder="What needs to be done?"
            disabled={isCreating}
            required
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={isCreating}
            className="rounded-l-none shrink-0 gap-1.5 text-sm"
          >
            {isCreating ? (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <Plus size={15} aria-hidden="true" />
            )}
            Add task
          </Button>
        </div>
      </form>

      {/* Empty state */}
      {todos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-display text-7xl font-bold italic text-primary/20 leading-none mb-5 select-none">
            All clear.
          </p>
          <p className="text-sm text-muted-foreground/70 max-w-xs leading-relaxed">
            Add your first task above to get started.
          </p>
        </div>
      )}

      {/* Todo grid */}
      <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
        {todos.map(todo => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onDelete={handleDeleteTodo}
            disabled={deleteTodoMutation.status === "pending"}
          />
        ))}
      </div>
    </div>
  );
}
