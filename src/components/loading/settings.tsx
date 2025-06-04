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
      <Tabs orientation="vertical" lazyBehavior="unmount" h="full">
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
              <Alert status="warning" variant="subtle" colorScheme="danger">
                <AlertIcon />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>This will delete all clipboard entries. This action cannot be undone.</AlertDescription>
              </Alert>
              <Button w="fit-content" disabled>
                Delete All Entries
              </Button>
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
