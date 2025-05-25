import { useCallback } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type ExcludedApp, addExcludedApp } from "~/utils/excluded-apps";

export function useAddExcludedAppForm(onSuccess?: () => void) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExcludedApp>();

  const onSubmit: SubmitHandler<ExcludedApp> = useCallback(
    async (data) => {
      const { name, path } = data;

      if (!name?.trim() || !path?.trim()) return;
      try {
        await addExcludedApp({
          name: name.trim(),
          path: path.trim(),
        });
        reset();
        onSuccess?.();
      } catch (error) {
        console.error("Failed to add excluded app:", error);
      }
    },
    [onSuccess, reset],
  );

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
  };
}
