import { flushSync } from "react-dom";
import * as React from "react";

export function useMutation<TVariables, TData, TError = unknown>(opts: {
  fn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (ctx: { data: TData }) => void | Promise<void>;
  onError?: (ctx: { error: TError }) => void | Promise<void>;
}) {
  const [submittedAt, setSubmittedAt] = React.useState<number | null>(null);
  const [variables, setVariables] = React.useState<TVariables | null>(null);
  const [error, setError] = React.useState<TError | null>(null);
  const [data, setData] = React.useState<TData | null>(null);
  const [status, setStatus] = React.useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  const mutateAsync = React.useCallback(
    async (newVariables: TVariables): Promise<TData | undefined> => {
      flushSync(() => {
        setStatus("pending");
        setSubmittedAt(Date.now());
        setVariables(newVariables);
      });

      try {
        const newData = await opts.fn(newVariables);
        await opts.onSuccess?.({ data: newData });
        flushSync(() => {
          setStatus("success");
          setError(null);
          setData(newData);
        });

        return newData;
      } catch (uerror: unknown) {
        const newError = uerror as TError;
        await opts.onError?.({ error: newError });
        flushSync(() => {
          setStatus("error");
          setError(newError);
        });
      }
    },
    [opts]
  );

  const mutate = React.useCallback(
    (mutationVars: TVariables): void => {
      mutateAsync(mutationVars);
    },
    [mutateAsync]
  );

  return {
    data,
    error,
    mutate,
    mutateAsync,
    status,
    submittedAt,
    variables,
  };
}
