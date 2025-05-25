import { createFileRoute } from "@tanstack/react-router";
import { Undo2Icon } from "@yamada-ui/lucide";
import { IconButton, TabList, TabPanels, Tabs, VStack } from "@yamada-ui/react";
import { SettingsLoadingComponent } from "~/components/loading/settings";
import { ExclusionSettings } from "~/components/settings";
import { Link } from "~/components/ui/link";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
  pendingComponent: SettingsLoadingComponent,
});

function RouteComponent() {
  return (
    <VStack h="100vh" py="0" position="relative">
      <Tabs orientation="vertical" lazyBehavior="unmount" h="full">
        <TabList pt="md">
          {/* <GeneralSettings.Switcher /> */}
          {/* <AppSettings.Switcher /> */}
          <ExclusionSettings.Switcher />
        </TabList>
        <TabPanels pt="xs">
          {/* <GeneralSettings.Panel /> */}
          {/* <AppSettings.Panel /> */}
          <ExclusionSettings.Panel />
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
}
