import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { getExcludedAppById, updateExcludedApp } from '~/utils/excluded-apps';

interface EditFormData {
  name: string;
  path: string;
}

export function useEditExcludedAppForm(
  appId: string | undefined,
  onSuccess?: () => void
) {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<EditFormData>();

  // Fetch app data using TanStack Query
  const { data: app } = useQuery({
    enabled: !!appId,
    queryFn: async () => getExcludedAppById(appId as string),
    queryKey: ['excluded-app', appId],
  });

  const onSubmit: SubmitHandler<EditFormData> = useCallback(
    async (data) => {
      if (!app?.id) {
        return;
      }

      const { name, path } = data;

      if (!(name.trim() && path.trim())) {
        return;
      }

      try {
        await updateExcludedApp(app.id, {
          name: name.trim(),
          path: path.trim(),
        });
        onSuccess?.();
        reset();
      } catch (error) {
        console.error('Failed to update excluded app:', error);
      }
    },
    [app?.id, onSuccess, reset]
  );

  return {
    handleSubmit,
    register,
    errors,
    onSubmit,
  };
}
