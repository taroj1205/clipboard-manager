import { Link } from "@tanstack/react-router";
import { CogIcon } from "@yamada-ui/lucide";
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
  ScrollArea,
  Separator,
  Skeleton,
  Spacer,
  Text,
  VStack,
} from "@yamada-ui/react";

export const HomeLoadingComponent = () => {
  return (
    <VStack gap="sm" h="100vh" p="sm" separator={<Separator />} color="white">
      {/* TopBar skeleton */}
      <HStack gap="0" w="full">
        <Input placeholder="Type to search..." roundedRight="none" borderRight="none" disabled />
        <IconButton
          as={Link}
          to="/settings"
          borderColor="border"
          variant="outline"
          aria-label="Settings"
          borderLeftRadius="none"
        >
          <CogIcon />
        </IconButton>
      </HStack>

      <HStack gap="xs" flex={1} align="stretch" separator={<Separator orientation="vertical" />}>
        {/* SidebarList skeleton */}
        <VStack w="full" minW="sm" maxW="sm" maxH="calc(100vh - 70px)" gap="xs">
          {Array.from({ length: 3 }, (_, groupIndex) => (
            <VStack
              key={`group-skeleton--${
                // biome-ignore lint/suspicious/noArrayIndexKey: Loading skeleton
                groupIndex
              }`}
              gap="xs"
            >
              {/* Date group header */}
              <Skeleton>
                <Text fontWeight="bold" fontSize="sm" p="sm">
                  Today
                </Text>
              </Skeleton>

              <List>
                {Array.from({ length: 4 }, (_, itemIndex) => (
                  <Skeleton
                    key={`item-skeleton--${groupIndex}-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      itemIndex
                    }`}
                    h="40px"
                  />
                ))}
              </List>
            </VStack>
          ))}
        </VStack>

        {/* DetailsPanel skeleton */}
        <VStack px="sm" gap="sm" w="full">
          {/* Content area */}
          <ScrollArea maxH="calc(100vh - 70px - 160px)" maxW="calc(100vw - 25px - sm)">
            <VStack gap="md">
              <Skeleton>
                <VStack gap="md" align="stretch">
                  <Text whiteSpace="pre-wrap" wordBreak="break-word">
                    This is sample clipboard content that shows how the text would appear in the details panel. It can be
                    multiple lines and wraps properly.
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
                <Skeleton>First Copied</Skeleton>
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>Application</DataListTerm>
              <DataListDescription>
                <Skeleton>Application Skeleton</Skeleton>
              </DataListDescription>
            </DataListItem>
          </DataList>
        </VStack>
      </HStack>
    </VStack>
  );
};
