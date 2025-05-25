import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { getExcludedAppById, updateExcludedApp } from "~/utils/excluded-apps";

interface EditFormData {
  name: string;
  path: string;
}

export function useEditExcludedAppForm(appId: string | undefined, onSuccess?: () => void) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>();

  // Fetch app data using TanStack Query
  const { data: app } = useQuery({
    queryKey: ["excluded-app", appId],
    queryFn: () => getExcludedAppById(appId as string),
    enabled: !!appId,
  });

  const onSubmit: SubmitHandler<EditFormData> = useCallback(
    async (data) => {
      if (!app?.id) return;

      const { name, path } = data;

      if (!name?.trim() || !path?.trim()) return;

      try {
        await updateExcludedApp(app.id, {
          name: name.trim(),
          path: path.trim(),
        });
        onSuccess?.();
        reset();
      } catch (error) {
        console.error("Failed to update excluded app:", error);
      }
    },
    [app?.id, onSuccess, reset],
  );

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
  };
}
