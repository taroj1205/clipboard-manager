import type { ExcludedApp } from "~/utils/excluded-apps";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { listen } from "@tauri-apps/api/event";
import { useMemo } from "react";
import { getAllExcludedApps } from "~/utils/excluded-apps";

export function useExcludedApps() {
  const queryClient = useQueryClient();

  const { data, isPending, isLoading } = useSuspenseQuery<ExcludedApp[]>({
    queryFn: async () => getAllExcludedApps(),
    queryKey: ["excluded-apps"],
  });

  const excludedApps = useMemo(() => {
    return data.flat();
  }, [data]);

  listen("excluded-apps-updated", () => {
    queryClient.invalidateQueries({ queryKey: ["excluded-apps"] });
  });

  return {
    excludedApps,
    hasData: !!excludedApps.length,
    isPending,
    isLoading,
  };
}
