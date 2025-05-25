import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { listen } from "@tauri-apps/api/event";
import { useMemo } from "react";
import { type ExcludedApp, getAllExcludedApps } from "~/utils/excluded-apps";

export function useExcludedApps() {
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery<ExcludedApp[], Error>({
    queryKey: ["excluded-apps"],
    queryFn: () => getAllExcludedApps(),
  });

  const excludedApps = useMemo(() => {
    return data.flat() || [];
  }, [data]);

  listen("excluded-apps-updated", () => {
    queryClient.invalidateQueries({ queryKey: ["excluded-apps"] });
  });

  return {
    excludedApps,
    hasData: !!excludedApps.length,
  };
}
