import { Text } from "@yamada-ui/react";
import type { Column } from "@yamada-ui/table";
import type { ExcludedApp } from "~/utils/excluded-apps";
import { ControlMenu } from "../control-menu";

export const NAME_COLUMN: Column<ExcludedApp> = {
  id: "name",
  header: "Name",
  accessorKey: "name",
  cell: ({ getValue }) => {
    const value = getValue() as string;
    if (!value) return null;
    return <Text>{value}</Text>;
  },
};

export const PATH_COLUMN: Column<ExcludedApp> = {
  id: "path",
  header: "Application Path",
  accessorKey: "path",
  cell: ({ getValue }) => {
    const value = getValue() as string;
    if (!value) return null;
    return (
      <Text fontSize="sm" color="muted" fontFamily="mono" isTruncated maxW="400px">
        {value}
      </Text>
    );
  },
};

export const DATE_COLUMN: Column<ExcludedApp> = {
  id: "createdAt",
  header: "Created At",
  accessorKey: "createdAt",
  css: { minW: "120px", w: "120px", maxW: "120px" },
  cell: ({ getValue }) => {
    const value = getValue() as number;
    if (!value) return null;
    const date = new Date(value);
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
    return <Text fontSize="sm">{formattedDate}</Text>;
  },
};

export const ACTIONS_COLUMN: Column<ExcludedApp> = {
  id: "actions",
  cell: ({ row }) => (row.original.id ? <ControlMenu rowId={row.original.id} /> : null),
};
