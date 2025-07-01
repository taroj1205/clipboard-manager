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
    <VStack gap="sm" h="100vh" p="sm" color="white" separator={<Separator />}>
      {/* TopBar skeleton */}
      <HStack gap="0" w="full">
        <Input disabled borderRight="none" placeholder="Type to search..." roundedRight="none" />
        <IconButton
          aria-label="Settings"
          variant="outline"
          as={Link}
          borderColor="border"
          borderLeftRadius="none"
          to="/settings"
        >
          <CogIcon />
        </IconButton>
      </HStack>

      <HStack align="stretch" flex={1} gap="xs" separator={<Separator orientation="vertical" />}>
        {/* SidebarList skeleton */}
        <VStack gap="xs" maxH="calc(100vh - 70px)" maxW="sm" minW="sm" w="full">
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
                <Text p="sm" fontSize="sm" fontWeight="bold">
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
        <VStack gap="sm" px="sm" w="full">
          {/* Content area */}
          <ScrollArea maxH="calc(100vh - 70px - 160px)" maxW="calc(100vw - 25px - sm)">
            <VStack gap="md">
              <Skeleton>
                <VStack align="stretch" gap="md">
                  <Text whiteSpace="pre-wrap" wordBreak="break-word">
                    This is sample clipboard content that shows how the text would appear in the details panel. It can
                    be multiple lines and wraps properly.
                  </Text>
                </VStack>
              </Skeleton>
            </VStack>
          </ScrollArea>

          <Spacer />

          <DataList w="fit-content" col={2}>
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
