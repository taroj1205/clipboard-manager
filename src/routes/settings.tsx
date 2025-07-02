import { createFileRoute } from "@tanstack/react-router";
import { Undo2Icon } from "@yamada-ui/lucide";
import { IconButton, TabList, TabPanels, Tabs, VStack } from "@yamada-ui/react";
import { SettingsLoadingComponent } from "~/components/loading/settings";
import { ExclusionSettings, GeneralSettings } from "~/components/settings";
import { Link } from "~/components/ui/link";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
  pendingComponent: SettingsLoadingComponent,
});

function RouteComponent() {
  return (
    <VStack h="100vh" position="relative" py="0">
      <Tabs h="full" lazyBehavior="unmount" orientation="vertical">
        <TabList pt="md">
          <GeneralSettings.Switcher />
          {/* <AppSettings.Switcher /> */}
          <ExclusionSettings.Switcher />
        </TabList>
        <TabPanels pt="xs">
          <GeneralSettings.Panel />
          {/* <AppSettings.Panel /> */}
          <ExclusionSettings.Panel />
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
}
