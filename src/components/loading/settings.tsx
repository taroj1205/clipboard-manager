import { Undo2Icon } from "@yamada-ui/lucide";
import {
  Heading,
  IconButton,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@yamada-ui/react";
import { Link } from "~/components/ui/link";

export const SettingsLoadingComponent = () => {
  return (
    <VStack h="100vh" position="relative" py="0">
      <Tabs h="full" lazyBehavior="unmount" orientation="vertical">
        <TabList pt="md">
          <Tab>General</Tab>
          <Tab>Exclusions</Tab>
          <Tab>Maintenance</Tab>
        </TabList>
        <TabPanels pt="xs">
          <TabPanel>
            <VStack>
              <Heading as="h2" fontSize="xl">
                General Settings
              </Heading>
              <VStack align="start" gap="xs">
                <Switch>Launch Clipboard Manager at login</Switch>
                <Text color="muted" fontSize="sm">
                  Automatically start the app when you sign in to your computer.
                </Text>
              </VStack>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <IconButton
        aria-label="Back to Home"
        as={Link}
        borderColor="border"
        position="fixed"
        right="sm"
        to="/"
        top="sm"
        variant="outline"
      >
        <Undo2Icon />
      </IconButton>
    </VStack>
  );
};
