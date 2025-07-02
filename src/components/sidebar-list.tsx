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
import { forwardRef, memo, useMemo } from "react";
import type { ClipboardEntry } from "~/utils/clipboard";
import { copyClipboardEntry } from "~/utils/clipboard";
import { ClipboardImage } from "./clipboard-image";

interface SidebarListProps {
  entries: ClipboardEntry[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  itemRefs: React.RefObject<(HTMLLIElement | null)[]>;
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
        day: "numeric",
        weekday: "long",
        year: "numeric",
        month: "long",
      });
    }
    groups[groupKey] ??= [];
    groups[groupKey].push({ ...entry, count });
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => b.timestamp - a.timestamp);
  }
  return groups;
}

const getBadgeColorScheme = (type: ClipboardEntry["type"]) => {
  switch (type) {
    case "text":
      return "purple";
    case "image":
      return "blue";
    case "color":
      return "yellow";
    default:
      return "gray";
  }
};

interface SidebarListItemProps {
  entry: ClipboardEntry & { count: number };
  isSelected: boolean;
  flatIndex: number;
  setSelectedIndex: (index: number) => void;
  notice: ReturnType<typeof useNotice>;
  refProp: (el: HTMLLIElement | null) => void;
}

const SidebarListItem = memo(
  ({
    entry,
    isSelected,
    flatIndex,
    setSelectedIndex,
    notice,
    refProp,
  }: SidebarListItemProps) => {
    return (
      <ListItem
        _hover={{ bg: "whiteAlpha.400" }}
        bg={isSelected ? "whiteAlpha.300" : undefined}
        borderRadius="md"
        cursor="pointer"
        onClick={() => setSelectedIndex(flatIndex)}
        onDoubleClick={async () => copyClipboardEntry(entry, notice)}
        px="2"
        py="1"
        ref={refProp}
        tabIndex={0}
        transitionDuration="fast"
        transitionProperty="background"
      >
        <HStack gap="sm">
          {entry.type === "image" ? (
            <ImageIcon fontSize="16px" />
          ) : (
            entry.type === "color" && (
              <ColorSwatch color={entry.content} h="16px" w="16px" />
            )
          )}
          {entry.type !== "color" && <FileIcon fontSize="16px" />}
          {entry.type === "image" && entry.path ? (
            <ClipboardImage
              alt={entry.content || "Clipboard entry"}
              maxH="20px"
              src={Array.isArray(entry.path) ? entry.path[0] : entry.path}
            />
          ) : (
            <Text fontSize="md" lineClamp={1}>
              {entry.content}
            </Text>
          )}
          <Spacer />
          {entry.count > 1 && (
            <Badge colorScheme="red" fontSize="xs" title="Copy count">
              x{entry.count}
            </Badge>
          )}
          <Badge colorScheme={getBadgeColorScheme(entry.type)}>
            {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
          </Badge>
        </HStack>
        <Text color="gray.400" fontSize="xs">
          {new Date(entry.timestamp).toLocaleString()}
        </Text>
      </ListItem>
    );
  }
);
SidebarListItem.displayName = "SidebarListItem";

export const SidebarList = memo(
  forwardRef<HTMLDivElement, SidebarListProps>(
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
      const grouped = useMemo(() => groupEntriesByDate(entries), [entries]);

      // Flat list for index mapping
      const flatList = useMemo(() => {
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
          <EmptyState maxH="calc(100vh - 70px)" minW="sm" size="md">
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
          gap="0"
          loading={<Loading fontSize="lg" />}
          maxH="calc(100vh - 70px)"
          maxW="sm"
          minW="sm"
          onLoad={({ finish }) => {
            if (
              totalEntries % 50 === 0 &&
              previousDataLength !== totalEntries
            ) {
              fetchNextPage();
            } else if (!hasNextPage) {
              finish();
            }
          }}
          overflowX="hidden"
          overflowY="auto"
          ref={ref}
          w="full"
        >
          {Object.entries(grouped).map(([date, groupedEntries]) => (
            <VStack align="stretch" gap="xs" key={date}>
              <Text
                fontSize="sm"
                fontWeight="bold"
                p="sm"
                roundedTop="md"
                top={0}
              >
                {date}
              </Text>
              <List>
                {groupedEntries.map((entry) => {
                  // Find the flat index for selection
                  const flatIndex = flatList.findIndex(
                    (e) =>
                      e.timestamp === entry.timestamp &&
                      e.content === entry.content
                  );
                  // Only render if flatIndex is in range
                  if (flatIndex === -1 || flatIndex >= flatList.length) {
                    return null;
                  }
                  const isSelected = flatIndex === selectedIndex;
                  const refProp = (el: HTMLLIElement | null) => {
                    itemRefs.current[flatIndex] = el;
                  };
                  return (
                    <SidebarListItem
                      entry={entry}
                      flatIndex={flatIndex}
                      isSelected={isSelected}
                      key={entry.timestamp + entry.content}
                      notice={notice}
                      refProp={refProp}
                      setSelectedIndex={setSelectedIndex}
                    />
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
