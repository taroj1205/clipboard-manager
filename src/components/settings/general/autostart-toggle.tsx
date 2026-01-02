import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { Switch, Text, useNotice, VStack } from "@yamada-ui/react";
import type { ChangeEvent } from "react";
import { memo, useCallback } from "react";

export const AutostartToggle = memo(() => {
  const notice = useNotice();
  const queryClient = useQueryClient();
  const { data: enabled } = useQuery({
    queryKey: ["autostart"],
    queryFn: isEnabled as () => Promise<boolean>,
  });
  const mutation = useMutation({
    mutationFn: async (nextEnabled: boolean) => {
      if (nextEnabled) {
        await enable();
        return;
      }

      await disable();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["autostart"],
      });
    },
    onError: () => {
      notice({
        status: "error",
        title: "Autostart",
        description: "Failed to update autostart setting.",
      });
    },
  });

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const nextEnabled = event.target.checked;

      await mutation.mutateAsync(nextEnabled);
    },
    [mutation]
  );

  return (
    <VStack align="start" gap="xs">
      <Switch checked={enabled} onChange={handleChange}>
        Launch Clipboard Manager at login
      </Switch>
      <Text color="muted" fontSize="sm">
        Automatically start the app when you sign in to your computer.
      </Text>
    </VStack>
  );
});

AutostartToggle.displayName = "AutostartToggle";
