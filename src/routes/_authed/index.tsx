import { toast } from "sonner";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
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
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog";

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
      <Card className="shadow-sm">
        <CardContent className="flex items-start gap-2 p-3">
          <div className="min-w-0 flex-1">
            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
              {todo.content}
            </p>
            <time className="mt-1 block text-xs text-muted-foreground">
              {new Date(todo.createdAt).toLocaleDateString("en-US", {
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
            className="mt-0.5 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={14} />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const deleteAllTrigger = (
  <Button
    variant="outline"
    size="sm"
    className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
  >
    <Trash2 size={14} />
    Delete all
  </Button>
);

const cancelButton = <Button variant="outline">Cancel</Button>;

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
        <DialogTitle>Delete all todos?</DialogTitle>
        <DialogDescription>
          This will permanently delete all {count}{" "}
          {count === 1 ? "todo" : "todos"}. This action cannot be undone.
        </DialogDescription>
        <div className="mt-6 flex justify-end gap-3">
          <DialogClose render={cancelButton} />
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Delete all
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
      toast.success("All todos were deleted");
    },
  });

  const isCreating = createTodoMutation.status === "pending";

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
    <div className="container mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Todos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {todos.length === 0
              ? "No tasks yet"
              : `${todos.length} ${todos.length === 1 ? "task" : "tasks"}`}
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
      <form onSubmit={handleCreateTodo} className="mb-8 flex gap-2">
        <Input
          name="content"
          ref={inputRef}
          type="text"
          className="text-sm py-3"
          placeholder="What needs to be done?"
          disabled={isCreating}
          required
          autoComplete="off"
        />
        <Button type="submit" disabled={isCreating} className="shrink-0 self-stretch py-3 text-sm">
          {isCreating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Add task
        </Button>
      </form>

      {/* Empty state */}
      {todos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <CheckCircle2 size={40} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">All clear!</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            You have no todos yet. Add your first task above to get started.
          </p>
        </div>
      )}

      {/* Todo grid */}
      <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
        {todos.map((todo) => (
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
