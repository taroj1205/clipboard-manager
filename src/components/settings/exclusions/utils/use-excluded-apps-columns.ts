import type { Column } from "@yamada-ui/table";
import { useMemo } from "react";
import type { ExcludedApp } from "~/utils/excluded-apps";
import {
  ACTIONS_COLUMN,
  DATE_COLUMN,
  NAME_COLUMN,
  PATH_COLUMN,
} from "./columns";

interface UseExcludedAppsColumnsOptions {
  hasName?: boolean;
  hasPath?: boolean;
  hasDate?: boolean;
  hasActions?: boolean;
}

export function useExcludedAppsColumns({
  hasName = true,
  hasPath = true,
  hasDate = true,
  hasActions = true,
}: UseExcludedAppsColumnsOptions = {}) {
  return useMemo(() => {
    const computedColumns: Column<ExcludedApp>[] = [];

    if (hasName) computedColumns.push(NAME_COLUMN);
    if (hasPath) computedColumns.push(PATH_COLUMN);
    if (hasDate) computedColumns.push(DATE_COLUMN);
    if (hasActions) computedColumns.push(ACTIONS_COLUMN);

    return computedColumns;
  }, [hasName, hasPath, hasDate, hasActions]);
}
