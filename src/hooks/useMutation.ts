import * as React from "react";
import { flushSync } from "react-dom";

export function useMutation<TVariables, TData, TError = unknown>(opts: {
  fn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (ctx: { data: TData }) => void | Promise<void>;
  onError?: (ctx: { error: TError }) => void | Promise<void>;
}) {
  const [submittedAt, setSubmittedAt] = React.useState<number | undefined>();
  const [variables, setVariables] = React.useState<TVariables | undefined>();
  const [error, setError] = React.useState<TError | undefined>();
  const [data, setData] = React.useState<TData | undefined>();
  const [status, setStatus] = React.useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  const mutateAsync = React.useCallback(
    async (variables: TVariables): Promise<TData | undefined> => {
      flushSync(() => {
        setStatus("pending");
        setSubmittedAt(Date.now());
        setVariables(variables);
      });

      try {
        const data = await opts.fn(variables);
        await opts.onSuccess?.({ data });
        flushSync(() => {
          setStatus("success");
          setError(undefined);
          setData(data);
        });

        return data;
      } catch (uerror: unknown) {
        const error = uerror as TError;
        await opts.onError?.({ error });
        flushSync(() => {
          setStatus("error");
          setError(error);
        });
      }
    },
    [opts]
  );

  const mutate = React.useCallback(
    (variables: TVariables): void => {
      void mutateAsync(variables);
    },
    [mutateAsync]
  );

  return {
    status,
    variables,
    submittedAt,
    mutate,
    mutateAsync,
    error,
    data,
  };
}
