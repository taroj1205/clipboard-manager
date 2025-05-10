import * as React from "react";
import {
  VStack,
  Text,
  List,
  ListItem,
  HStack,
  Badge,
  ScrollArea,
  useNotice,
  Spacer,
} from "@yamada-ui/react";
import { ClipboardEntry } from "../utils/clipboard";
import { ClipboardImage } from "./clipboard-image";
import { copyClipboardEntry } from "../utils/clipboard";
import { FileIcon, ImageIcon } from "@yamada-ui/lucide";

interface SidebarListProps {
  grouped: Record<string, (ClipboardEntry & { count: number })[]>;
  selectedIndex: number | null;
  setSelectedIndex: (index: number) => void;
  itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
}

export const SidebarList = React.memo(
  React.forwardRef<HTMLDivElement, SidebarListProps>(
    ({ grouped, selectedIndex, setSelectedIndex, itemRefs }, ref) => {
      let index = 0;
      const notice = useNotice();

      return (
        <ScrollArea
          w="full"
          minW="sm"
          maxW="sm"
          maxH="calc(100vh - 70px)"
          overflowY="auto"
          overflowX="hidden"
          ref={ref}
        >
          {Object.entries(grouped).map(([date, entries]) => (
            <VStack key={date} align="stretch" gap="xs">
              <Text
                fontWeight="bold"
                fontSize="sm"
                p="sm"
                position="sticky"
                top={0}
                zIndex="sticky"
                bg="blackAlpha.100"
                backdropFilter="blur(10px)"
                rounded="md"
              >
                {date}
              </Text>
              <List>
                {entries.map((entry) => {
                  const isSelected = index === selectedIndex;
                  const currentIndex = index;
                  const refProp = (el: HTMLLIElement | null) => {
                    itemRefs.current[currentIndex] = el;
                  };
                  index++;
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
                      onClick={() => setSelectedIndex(currentIndex)}
                      onDoubleClick={() => copyClipboardEntry(entry, notice)}
                      tabIndex={0}
                      _hover={{ bg: "whiteAlpha.400" }}
                    >
                      <HStack gap="sm">
                        {entry.type === "image" ? (
                          <ImageIcon fontSize="16px" />
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
        </ScrollArea>
      );
    }
  )
);

SidebarList.displayName = "SidebarList";
