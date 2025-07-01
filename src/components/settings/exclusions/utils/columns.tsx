import type { Column } from "@yamada-ui/table";
import type { ExcludedApp } from "~/utils/excluded-apps";
import { Text } from "@yamada-ui/react";
import { ControlMenu } from "../control-menu";

export const NAME_COLUMN: Column<ExcludedApp> = {
  id: "name",
  cell: ({ getValue }) => {
    const value = getValue() as string;
    if (!value) return null;
    return <Text>{value}</Text>;
  },
  header: "Name",
  accessorKey: "name",
};

export const PATH_COLUMN: Column<ExcludedApp> = {
  id: "path",
  cell: ({ getValue }) => {
    const value = getValue() as string;
    if (!value) return null;
    return (
      <Text isTruncated maxW="400px" color="muted" fontFamily="mono" fontSize="sm">
        {value}
      </Text>
    );
  },
  header: "Application Path",
  accessorKey: "path",
};

export const DATE_COLUMN: Column<ExcludedApp> = {
  id: "createdAt",
  css: { maxW: "120px", minW: "120px", w: "120px" },
  cell: ({ getValue }) => {
    const value = getValue() as number;
    if (!value) return null;
    const date = new Date(value);
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      minute: "2-digit",
      year: "numeric",
      hour: "2-digit",
      month: "short",
    }).format(date);
    return <Text fontSize="sm">{formattedDate}</Text>;
  },
  header: "Created At",
  accessorKey: "createdAt",
};

export const ACTIONS_COLUMN: Column<ExcludedApp> = {
  id: "actions",
  cell: ({ row }) => (row.original.id ? <ControlMenu rowId={row.original.id} /> : null),
};
