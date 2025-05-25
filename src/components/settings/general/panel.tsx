import { Heading, TabPanel } from "@yamada-ui/react";
import { memo } from "react";

export const Panel = memo(() => {
  return (
    <TabPanel>
      <Heading as="h2" fontSize="xl">
        General Settings
      </Heading>
    </TabPanel>
  );
});

Panel.displayName = "Panel";
