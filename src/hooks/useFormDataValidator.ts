import { z, type ZodError, type ZodSchema } from "zod";
import { useMemo, useState } from "react";

export function useFormDataValidator<T extends ZodSchema>(schema: T) {
  const [zodErrors, setZodErrors] = useState<ZodError<z.infer<T>>>();

  const errors = useMemo(() => {
    if (!zodErrors) {
      return undefined;
    }

    return z.treeifyError(zodErrors);
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
