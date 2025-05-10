import * as React from "react";
import {
  Text,
  Badge,
  Center,
  DataList,
  DataListItem,
  DataListTerm,
  DataListDescription,
  ScrollArea,
  Grid,
  GridItem,
  IconButton,
  useNotice,
  Float,
} from "@yamada-ui/react";
import { CopyIcon, ImageIcon, TextIcon } from "@yamada-ui/lucide";
import type { ClipboardEntry } from "../utils/clipboard";
import { ClipboardImage } from "./clipboard-image";
import { writeText } from "tauri-plugin-clipboard-api";
import { copyClipboardEntry } from "../utils/clipboard";

interface DetailsPanelProps {
  selectedEntry: (ClipboardEntry & { count?: number }) | null;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = React.memo(
  ({ selectedEntry }) => {
    const notice = useNotice();

    if (!selectedEntry) {
      return (
        <Center flex={1}>
          <Text fontSize="xl" color="muted">
            Select an entry to see details
          </Text>
        </Center>
      );
    }

    const ocrCopyable =
      selectedEntry.type === "image" &&
      selectedEntry.content &&
      selectedEntry.content !== "[Extracting text...]";

    return (
      <Grid gridTemplateRows="1fr auto" p="sm" gap="sm" w="full">
        <GridItem position="relative">
          <Float
            gap="xs"
            placement="start-end"
            right={ocrCopyable ? "xl" : "md"}
            top="sm"
          >
            <IconButton
              size="sm"
              variant="ghost"
              icon={
                selectedEntry.type === "image" ? <ImageIcon /> : <CopyIcon />
              }
              onClick={async () => {
                await copyClipboardEntry(selectedEntry, notice);
              }}
            />
            {ocrCopyable && (
              <IconButton
                aria-label="Copy OCR Text"
                icon={<TextIcon />}
                size="sm"
                variant="ghost"
                onClick={async () => {
                  try {
                    await writeText(selectedEntry.content);
                    notice({
                      title: "OCR text copied!",
                      description: "OCR text copied!",
                      status: "success",
                    });
                  } catch (e) {
                    notice({
                      title: "Failed to copy OCR text",
                      description: "Failed to copy OCR text",
                      status: "error",
                    });
                  }
                }}
                title="Copy OCR Text"
              />
            )}
          </Float>
          <ScrollArea
            maxH="calc(100vh - 70px - 160px)"
            maxW="calc(100vw - 25px - sm)"
          >
            {selectedEntry.type === "image" && selectedEntry.path ? (
              <ClipboardImage
                src={
                  Array.isArray(selectedEntry.path)
                    ? selectedEntry.path[0]
                    : selectedEntry.path
                }
                boxSize="xl"
              />
            ) : (
              <Text>{selectedEntry.content}</Text>
            )}
          </ScrollArea>
        </GridItem>
        <GridItem>
          <DataList col={2} w="fit-content">
            <DataListItem>
              <DataListTerm>Copy Count</DataListTerm>
              <DataListDescription>
                {selectedEntry.count || 1} times
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>Content Type</DataListTerm>
              <DataListDescription>
                <Badge
                  colorScheme={
                    selectedEntry.type === "text"
                      ? "purple"
                      : selectedEntry.type === "image"
                      ? "blue"
                      : selectedEntry.type === "color"
                      ? "yellow"
                      : "gray"
                  }
                >
                  {selectedEntry.type.charAt(0).toUpperCase() +
                    selectedEntry.type.slice(1)}
                </Badge>
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>First Copied</DataListTerm>
              <DataListDescription>
                {new Date(selectedEntry.timestamp).toLocaleString()}
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>Application</DataListTerm>
              <DataListDescription>
                {selectedEntry.app || "Unknown"}
              </DataListDescription>
            </DataListItem>
          </DataList>
        </GridItem>
      </Grid>
    );
  }
);

DetailsPanel.displayName = "DetailsPanel";
