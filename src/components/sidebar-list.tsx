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
  VStack,
  useNotice,
} from "@yamada-ui/react";
import * as React from "react";
import { type ClipboardEntry, copyClipboardEntry } from "../utils/clipboard";
import { ClipboardImage } from "./clipboard-image";

interface SidebarListProps {
  entries: ClipboardEntry[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  selectedIndex: number | null;
  setSelectedIndex: (index: number) => void;
  itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
  previousDataLength: number | undefined;
  totalEntries: number;
}

// Grouping helper (copy from index.tsx)
function groupEntriesByDate(
  entries: (ClipboardEntry & { count?: number })[]
): Record<string, (ClipboardEntry & { count: number })[]> {
  const groups: Record<string, (ClipboardEntry & { count: number })[]> = {};
  const dedupedMap = new Map<
    string,
    { entry: ClipboardEntry; count: number }
  >();
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
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
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
        isFetchingNextPage,
        isLoading,
        selectedIndex,
        setSelectedIndex,
        itemRefs,
        previousDataLength,
        totalEntries,
      },
      ref
    ) => {
      const notice = useNotice({ isClosable: true, closeStrategy: "both" });

      // Group entries by date
      const grouped = React.useMemo(
        () => groupEntriesByDate(entries),
        [entries]
      );

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

      // Refs for keyboard navigation
      flatList.forEach((_, i) => {
        itemRefs.current[i] = itemRefs.current[i] || null;
      });

      if (flatList.length === 0) {
        return (
          <EmptyState size="md" minW="sm" maxH="calc(100vh - 70px)">
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
          as={ScrollArea}
          w="full"
          minW="sm"
          maxW="sm"
          maxH="calc(100vh - 70px)"
          overflowY="auto"
          gap="0"
          overflowX="hidden"
          ref={ref}
          onLoad={({ finish }) => {
            console.log(totalEntries, previousDataLength);
            if (
              totalEntries % 50 === 0 &&
              previousDataLength !== totalEntries
            ) {
              console.log("fetching next page");
              fetchNextPage();
            } else {
              if (!hasNextPage) finish();
            }
          }}
          loading={<Loading fontSize="lg" />}
        >
          {Object.entries(grouped).map(([date, entries]) => (
            <VStack key={date} align="stretch" gap="xs">
              <Text
                fontWeight="bold"
                fontSize="sm"
                p="sm"
                position="sticky"
                bg="transparentize(black, 70%)"
                top={0}
                roundedTop="md"
              >
                {date}
              </Text>
              <List>
                {entries.map((entry) => {
                  // Find the flat index for selection
                  const flatIndex = flatList.findIndex(
                    (e) =>
                      e.timestamp === entry.timestamp &&
                      e.content === entry.content
                  );
                  // Only render if flatIndex is in range
                  if (flatIndex === -1 || flatIndex >= flatList.length)
                    return null;
                  const isSelected = flatIndex === selectedIndex;
                  const refProp = (el: HTMLLIElement | null) => {
                    itemRefs.current[flatIndex] = el;
                  };
                  return (
                    <ListItem
                      ref={refProp}
                      key={entry.timestamp + entry.content}
                      bg={isSelected ? "whiteAlpha.300" : undefined}
                      borderRadius="md"
                      transitionProperty="background"
                      transitionDuration="fast"
                      px="2"
                      py="1"
                      cursor="pointer"
                      onClick={() => setSelectedIndex(flatIndex)}
                      onDoubleClick={() => copyClipboardEntry(entry, notice)}
                      tabIndex={0}
                      _hover={{ bg: "whiteAlpha.400" }}
                    >
                      <HStack gap="sm">
                        {entry.type === "image" ? (
                          <ImageIcon fontSize="16px" />
                        ) : entry.type === "color" ? (
                          <ColorSwatch
                            h="16px"
                            w="16px"
                            color={entry.content}
                          />
                        ) : (
                          <FileIcon fontSize="16px" />
                        )}
                        {entry.type === "image" && entry.path ? (
                          <ClipboardImage
                            src={
                              Array.isArray(entry.path)
                                ? entry.path[0]
                                : entry.path
                            }
                            alt={entry.content ?? "Clipboard entry"}
                            maxH="20px"
                          />
                        ) : (
                          <Text lineClamp={1} fontSize="md">
                            {entry.content}
                          </Text>
                        )}
                        <Spacer />
                        {entry.count > 1 && (
                          <Badge
                            colorScheme="red"
                            fontSize="xs"
                            title="Copy count"
                          >
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
                          {entry.type.charAt(0).toUpperCase() +
                            entry.type.slice(1)}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.400">
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
