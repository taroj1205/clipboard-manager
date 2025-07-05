import { Link } from "@tanstack/react-router";
import { ArrowDown01Icon, CogIcon } from "@yamada-ui/lucide";
import {
  Badge,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  HStack,
  IconButton,
  Input,
  List,
  Menu,
  MenuButton,
  MultiSelect,
  ScrollArea,
  Separator,
  Skeleton,
  Spacer,
  Text,
  VStack,
} from "@yamada-ui/react";

export const HomeLoadingComponent = () => {
  return (
    <VStack color="white" gap="sm" h="100vh" p="sm" separator={<Separator />}>
      {/* TopBar skeleton - matches actual design */}
      <HStack gap="xs" w="full">
        <Input disabled placeholder="Type to search..." />
        <MultiSelect disabled placeholder="Filter types..." w="200px" />
        <Menu>
          <MenuButton
            aria-label="Sort options"
            as={IconButton}
            borderColor={["border", "border"]}
            disabled
            icon={<ArrowDown01Icon />}
            variant="outline"
          />
        </Menu>
        <IconButton
          aria-label="Settings"
          as={Link}
          borderColor="border"
          disabled
          to="/settings"
          variant="outline"
        >
          <CogIcon />
        </IconButton>
      </HStack>

      <HStack
        align="stretch"
        flex={1}
        gap="xs"
        separator={<Separator orientation="vertical" />}
      >
        {/* SidebarList skeleton */}
        <VStack gap="xs" maxH="calc(100vh - 70px)" maxW="sm" minW="sm" w="full">
          {Array.from({ length: 3 }, (_, groupIndex) => (
            <VStack
              gap="xs"
              key={`group-${
                // biome-ignore lint/suspicious/noArrayIndexKey: this is skeleton
                groupIndex
              }`}
            >
              {/* Date group header */}
              <Skeleton>
                <Text fontSize="sm" fontWeight="bold" p="sm">
                  {(() => {
                    if (groupIndex === 0) {
                      return "Today";
                    }
                    if (groupIndex === 1) {
                      return "Yesterday";
                    }
                    return "This Week";
                  })()}
                </Text>
              </Skeleton>

              <List>
                {Array.from(
                  { length: Math.max(1, 4 - groupIndex) },
                  (_date, itemIndex) => (
                    <Skeleton
                      h="60px"
                      key={`item-${groupIndex}-${
                        // biome-ignore lint/suspicious/noArrayIndexKey: this is skeleton
                        itemIndex
                      }`}
                      mb="xs"
                    />
                  )
                )}
              </List>
            </VStack>
          ))}
        </VStack>

        {/* DetailsPanel skeleton */}
        <VStack gap="sm" px="sm" w="full">
          {/* Content area */}
          <ScrollArea
            maxH="calc(100vh - 70px - 160px)"
            maxW="calc(100vw - 25px - sm)"
          >
            <VStack gap="md">
              <Skeleton>
                <VStack align="stretch" gap="md">
                  <Text whiteSpace="pre-wrap" wordBreak="break-word">
                    This is sample clipboard content that shows how the text
                    would appear in the details panel. It can be multiple lines
                    and wraps properly. Loading your clipboard history...
                  </Text>
                </VStack>
              </Skeleton>
            </VStack>
          </ScrollArea>

          <Spacer />

          <DataList col={2} w="fit-content">
            <DataListItem>
              <DataListTerm>Copy Count</DataListTerm>
              <DataListDescription>
                <Skeleton>3 times</Skeleton>
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>Content Type</DataListTerm>
              <DataListDescription>
                <Skeleton>
                  <Badge>Text</Badge>
                </Skeleton>
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>First Copied</DataListTerm>
              <DataListDescription>
                <Skeleton>2 minutes ago</Skeleton>
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>Application</DataListTerm>
              <DataListDescription>
                <Skeleton>VS Code</Skeleton>
              </DataListDescription>
            </DataListItem>
          </DataList>
        </VStack>
      </HStack>
    </VStack>
  );
};
