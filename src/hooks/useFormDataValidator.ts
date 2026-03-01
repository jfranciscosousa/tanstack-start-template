import { z, type ZodError, type ZodSchema } from "zod";
import { useMemo, useState } from "react";

type FieldMessage = { message: string };

type FieldErrors<T extends ZodSchema> = {
  [Key in keyof z.infer<T>]?: FieldMessage[];
};

export function useFormDataValidator<T extends ZodSchema>(schema: T) {
  const [zodErrors, setZodErrors] = useState<ZodError<z.infer<T>>>();

  const errors = useMemo((): FieldErrors<T> | undefined => {
    if (!zodErrors) {
      return undefined;
    }

    const tree = z.treeifyError(zodErrors) as {
      properties?: Record<string, { errors?: string[] } | undefined>;
    };

    if (!tree.properties) {
      return undefined;
    }

    const result: Record<string, FieldMessage[]> = {};

    for (const [key, value] of Object.entries(tree.properties)) {
      if (value?.errors?.length) {
        result[key] = value.errors.map((error) => ({ message: error }));
      }
    }

    return result as FieldErrors<T>;
  }, [zodErrors]);

  function validate(formData: FormData) {
    const validationResult = schema.safeParse(formData);

    if (validationResult.error) {
      setZodErrors(validationResult.error);
      return false;
    }

    setZodErrors(undefined);
    return true;
  }

  return {
    errors,
    validate,
  };
}
