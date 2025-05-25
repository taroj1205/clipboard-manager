import { PlusIcon, Undo2Icon } from "@yamada-ui/lucide";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  HStack,
  Heading,
  IconButton,
  Loading,
  Skeleton,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  TableContainer,
  Tabs,
  Text,
  VStack,
} from "@yamada-ui/react";
import { PagingTable } from "@yamada-ui/table";
import { Link } from "~/components/ui/link";

export const SettingsLoadingComponent = () => {
  // Mock data for the skeleton table
  const mockColumns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "path", header: "Path" },
    { accessorKey: "actions", header: "Actions" },
  ];

  const mockData = Array.from({ length: 3 }, (_, i) => ({
    id: `mock-${i}`,
    name: `Sample Application ${i + 1}`,
    path: `C:\\Program Files\\Sample App ${i + 1}\\app.exe`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));

  return (
    <VStack h="100vh" py="0" position="relative">
      <Tabs orientation="vertical" lazyBehavior="unmount" h="full">
        <TabList pt="md">
          <Tab>Exclusions</Tab>
        </TabList>
        <TabPanels pt="xs">
          <TabPanel>
            <VStack>
              <VStack gap="sm">
                <Heading as="h2" fontSize="xl">
                  Application Exclusions
                </Heading>
                <Text color="muted" fontSize="sm">
                  Applications in this list will be excluded from clipboard monitoring. No clipboard entries will be recorded
                  when these applications are active.
                </Text>
              </VStack>
              <Alert status="info" variant="left-accent">
                <AlertIcon />
                <AlertDescription>
                  You currently have <Loading fontSize="8.5px" /> application(s) excluded from clipboard monitoring.
                </AlertDescription>
              </Alert>
              <HStack>
                <Text fontSize="md" fontWeight="medium">
                  Excluded Applications <Loading />
                </Text>
                <Spacer />
                <Button startIcon={<PlusIcon />} size="sm" disabled>
                  Add Application
                </Button>
              </HStack>
              <Skeleton w="full">
                <TableContainer w="full">
                  <PagingTable
                    columns={mockColumns}
                    data={mockData}
                    size="md"
                    withBorder
                    highlightOnHover
                    rowsClickSelect
                    withPagingControl
                    rounded="md"
                    rowId="id"
                    headerProps={{ textTransform: "capitalize" }}
                    sx={{ "tbody > tr:last-of-type > td": { borderBottomWidth: "0px" } }}
                    borderCollapse="separate"
                    borderWidth="1px"
                  />
                </TableContainer>
              </Skeleton>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <IconButton
        position="fixed"
        top="sm"
        right="sm"
        variant="outline"
        as={Link}
        to="/"
        aria-label="Back to Home"
        borderColor="border"
      >
        <Undo2Icon />
      </IconButton>
    </VStack>
  );
};
