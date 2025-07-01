import type { ClipboardEntry } from "~/utils/clipboard";
import { FileIcon, ImageIcon } from "@yamada-ui/lucide";
import {
  Badge,
  ColorSwatch,
  EmptyState,
  EmptyStateDescription,
  EmptyStateIndicator,
  EmptyStateTitle,
  HStack,
  InfiniteScrollArea,
  List,
  ListItem,
  Loading,
  ScrollArea,
  Spacer,
  Text,
  useNotice,
  VStack,
} from "@yamada-ui/react";
import * as React from "react";
import { copyClipboardEntry } from "~/utils/clipboard";
import { ClipboardImage } from "./clipboard-image";

interface SidebarListProps {
  entries: ClipboardEntry[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
  selectedIndex: null | number;
  setSelectedIndex: (index: number) => void;
  isLoading: boolean;
  previousDataLength: number | undefined;
  totalEntries: number;
}

// Grouping helper (copy from index.tsx)
function groupEntriesByDate(entries: (ClipboardEntry & { count?: number })[]): {
  [key: string]: (ClipboardEntry & { count: number })[];
} {
  const groups: { [key: string]: (ClipboardEntry & { count: number })[] } = {};
  const dedupedMap = new Map<string, { entry: ClipboardEntry; count: number }>();
  for (const entry of entries) {
    const key = `${entry.type}::${entry.content}`;
    if (dedupedMap.has(key)) {
      const existing = dedupedMap.get(key);
      if (existing) {
        existing.count++;
      }
    } else {
      dedupedMap.set(key, { entry, count: 1 });
    }
  }
  for (const { entry, count } of dedupedMap.values()) {
    const date = new Date(entry.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday";
    } else {
      groupKey = date.toLocaleDateString("en-US", {
        day: "numeric",
        weekday: "long",
        year: "numeric",
        month: "long",
      });
    }
    groups[groupKey] ??= [];
    groups[groupKey].push({ ...entry, count });
  }
  for (const key in groups) {
    groups[key].sort((a, b) => b.timestamp - a.timestamp);
  }
  return groups;
}

export const SidebarList = React.memo(
  React.forwardRef<HTMLDivElement, SidebarListProps>(
    (
      {
        entries,
        fetchNextPage,
        hasNextPage,
        itemRefs,
        selectedIndex,
        setSelectedIndex,
        previousDataLength,
        totalEntries,
      },
      ref
    ) => {
      const notice = useNotice({ closeStrategy: "both", isClosable: true });

      // Group entries by date
      const grouped = React.useMemo(() => groupEntriesByDate(entries), [entries]);

      // Flat list for index mapping
      const flatList = React.useMemo(() => {
        const arr: (ClipboardEntry & { count: number; group: string })[] = [];
        for (const [date, items] of Object.entries(grouped)) {
          for (const item of items) {
            arr.push({ ...item, group: date });
          }
        }
        return arr;
      }, [grouped]);

      // Initialize refs array with correct length, preserving existing refs
      if (itemRefs.current.length !== flatList.length) {
        const oldRefs = itemRefs.current;
        itemRefs.current = new Array(flatList.length);
        // Preserve existing refs where possible
        for (let i = 0; i < flatList.length; i++) {
          itemRefs.current[i] = i < oldRefs.length ? oldRefs[i] : null;
        }
      }

      if (flatList.length === 0) {
        return (
          <EmptyState size="md" maxH="calc(100vh - 70px)" minW="sm">
            <EmptyStateIndicator>
              <FileIcon fontSize="40px" />
            </EmptyStateIndicator>
            <EmptyStateTitle>No clipboard entries</EmptyStateTitle>
            <EmptyStateDescription>
              Your clipboard history is empty. Copy something to get started!
            </EmptyStateDescription>
          </EmptyState>
        );
      }

      return (
        <InfiniteScrollArea
          ref={ref}
          as={ScrollArea}
          gap="0"
          maxH="calc(100vh - 70px)"
          maxW="sm"
          minW="sm"
          w="full"
          loading={<Loading fontSize="lg" />}
          onLoad={({ finish }) => {
            if (totalEntries % 50 === 0 && previousDataLength !== totalEntries) {
              fetchNextPage();
            } else {
              if (!hasNextPage) finish();
            }
          }}
          overflowX="hidden"
          overflowY="auto"
        >
          {Object.entries(grouped).map(([date, entries]) => (
            <VStack key={date} align="stretch" gap="xs">
              <Text p="sm" fontSize="sm" fontWeight="bold" roundedTop="md" top={0}>
                {date}
              </Text>
              <List>
                {entries.map((entry) => {
                  // Find the flat index for selection
                  const flatIndex = flatList.findIndex(
                    (e) => e.timestamp === entry.timestamp && e.content === entry.content
                  );
                  // Only render if flatIndex is in range
                  if (flatIndex === -1 || flatIndex >= flatList.length) return null;
                  const isSelected = flatIndex === selectedIndex;
                  const refProp = (el: HTMLLIElement | null) => {
                    itemRefs.current[flatIndex] = el;
                  };
                  return (
                    <ListItem
                      key={entry.timestamp + entry.content}
                      ref={refProp}
                      bg={isSelected ? "whiteAlpha.300" : undefined}
                      px="2"
                      py="1"
                      tabIndex={0}
                      _hover={{ bg: "whiteAlpha.400" }}
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => setSelectedIndex(flatIndex)}
                      onDoubleClick={async () => copyClipboardEntry(entry, notice)}
                      transitionDuration="fast"
                      transitionProperty="background"
                    >
                      <HStack gap="sm">
                        {entry.type === "image" ? (
                          <ImageIcon fontSize="16px" />
                        ) : entry.type === "color" ? (
                          <ColorSwatch h="16px" w="16px" color={entry.content} />
                        ) : (
                          <FileIcon fontSize="16px" />
                        )}
                        {entry.type === "image" && entry.path ? (
                          <ClipboardImage
                            src={Array.isArray(entry.path) ? entry.path[0] : entry.path}
                            alt={entry.content || "Clipboard entry"}
                            maxH="20px"
                          />
                        ) : (
                          <Text lineClamp={1} fontSize="md">
                            {entry.content}
                          </Text>
                        )}
                        <Spacer />
                        {entry.count > 1 && (
                          <Badge title="Copy count" colorScheme="red" fontSize="xs">
                            x{entry.count}
                          </Badge>
                        )}
                        <Badge
                          colorScheme={
                            entry.type === "text"
                              ? "purple"
                              : entry.type === "image"
                                ? "blue"
                                : entry.type === "color"
                                  ? "yellow"
                                  : "gray"
                          }
                        >
                          {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                        </Badge>
                      </HStack>
                      <Text color="gray.400" fontSize="xs">
                        {new Date(entry.timestamp).toLocaleString()}
                      </Text>
                    </ListItem>
                  );
                })}
              </List>
            </VStack>
          ))}
        </InfiniteScrollArea>
      );
    }
  )
);

SidebarList.displayName = "SidebarList";
