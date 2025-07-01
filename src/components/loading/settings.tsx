import { Undo2Icon } from "@yamada-ui/lucide";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Heading,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@yamada-ui/react";
import { Link } from "~/components/ui/link";

export const SettingsLoadingComponent = () => {
  return (
    <VStack h="100vh" py="0" position="relative">
      <Tabs h="full" lazyBehavior="unmount" orientation="vertical">
        <TabList pt="md">
          <Tab>General</Tab>
          <Tab>Exclusions</Tab>
        </TabList>
        <TabPanels pt="xs">
          <TabPanel>
            <VStack>
              <Heading as="h2" fontSize="xl">
                General Settings
              </Heading>
              <Heading as="h3" fontSize="lg">
                Clipboard Entries
              </Heading>
              <Alert variant="subtle" status="warning" colorScheme="danger">
                <AlertIcon />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This will delete all clipboard entries. This action cannot be undone.
                </AlertDescription>
              </Alert>
              <Button disabled w="fit-content">
                Delete All Entries
              </Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <IconButton
        aria-label="Back to Home"
        variant="outline"
        as={Link}
        right="sm"
        borderColor="border"
        position="fixed"
        to="/"
        top="sm"
      >
        <Undo2Icon />
      </IconButton>
    </VStack>
  );
};
