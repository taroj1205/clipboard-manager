import {
  Alert,
  AlertDescription,
  AlertIcon,
  Heading,
  HStack,
  Spacer,
  TableContainer,
  TabPanel,
  Text,
  VStack,
} from "@yamada-ui/react";
import { PagingTable } from "@yamada-ui/table";
import { memo } from "react";
import type { ExcludedApp } from "~/utils/excluded-apps";
import { AddExcludedAppModal } from "./add-excluded-app-modal";
import {
  useExcludedApps,
  useExcludedAppsColumns,
  useExcludedAppsTableProps,
} from "./utils";

export const Panel = memo(() => {
  const { excludedApps } = useExcludedApps();
  const columns = useExcludedAppsColumns();
  const { cellProps } = useExcludedAppsTableProps();

  const hasData = !!excludedApps.length;
  const resolvedData: ExcludedApp[] = hasData
    ? excludedApps
    : [
        {
          id: "",
          name: "No applications excluded",
          createdAt: 0,
          empty: true,
          path: "",
          updatedAt: 0,
        },
      ];

  return (
    <TabPanel>
      <VStack>
        <VStack gap="sm">
          <Heading as="h2" fontSize="xl">
            Application Exclusions
          </Heading>
          <Text color="muted" fontSize="sm">
            Applications in this list will be excluded from clipboard
            monitoring. No clipboard entries will be recorded when these
            applications are active.
          </Text>
        </VStack>
        <Alert status="info" variant="left-accent">
          <AlertIcon />
          <AlertDescription>
            You currently have {excludedApps.length} application(s) excluded
            from clipboard monitoring.
          </AlertDescription>
        </Alert>
        <HStack>
          <Text fontSize="md" fontWeight="medium">
            Excluded Applications ({excludedApps.length})
          </Text>
          <Spacer />
          <AddExcludedAppModal />
        </HStack>
        <TableContainer>
          <PagingTable<ExcludedApp>
            borderCollapse="separate"
            borderWidth="1px"
            cellProps={cellProps}
            checkboxProps={{ disabled: !hasData }}
            columns={columns}
            data={resolvedData}
            headerProps={{ textTransform: "capitalize" }}
            highlightOnHover={hasData}
            rounded="md"
            rowId="id"
            rowsClickSelect={hasData}
            size="md"
            sx={{
              "tbody > tr:last-of-type > td": { borderBottomWidth: "0px" },
            }}
            withBorder
            withPagingControl={hasData}
          />{" "}
        </TableContainer>
      </VStack>
    </TabPanel>
  );
});

Panel.displayName = "Panel";
