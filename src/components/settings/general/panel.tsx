import { Heading, TabPanel, VStack } from '@yamada-ui/react';
import { memo } from 'react';
import { DeleteAll } from './delete-all';

export const Panel = memo(() => {
  return (
    <TabPanel>
      <VStack>
        <Heading as="h2" fontSize="xl">
          General Settings
        </Heading>
        <Heading as="h3" fontSize="lg">
          Clipboard Entries
        </Heading>
        <DeleteAll />
      </VStack>
    </TabPanel>
  );
});

Panel.displayName = 'Panel';
