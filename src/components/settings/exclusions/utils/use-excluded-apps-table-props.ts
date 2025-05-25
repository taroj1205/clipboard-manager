import type { TdProps } from "@yamada-ui/react";
import type { Cell } from "@yamada-ui/table";
import { useCallback } from "react";
import type { ExcludedApp } from "~/utils/excluded-apps";

export function useExcludedAppsTableProps() {
  const cellProps = useCallback(
    ({ column, row }: Cell<ExcludedApp, unknown>) => {
      const props: TdProps = { verticalAlign: "middle" };

      if (row.original.empty) {
        if (column.columnDef.header === "Application Name") {
          props.colSpan = 4;
          props.textAlign = "center";
          props.color = "muted";
          props.h = "3xs";
        } else {
          props.display = "none";
        }
      } else {
        if (column.columnDef.id === "actions") {
          props.textAlign = "center";
        }
      }

      return props;
    },
    []
  );

  return { cellProps };
}
