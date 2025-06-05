import { pictureDir } from "@tauri-apps/api/path";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { CopyIcon, ImageIcon, RefreshCwIcon, TextIcon, TrashIcon } from "@yamada-ui/lucide";
import {
  Badge,
  ButtonGroup,
  Center,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Grid,
  GridItem,
  IconButton,
  ScrollArea,
  Text,
  isArray,
  useLoading,
  useNotice,
  useOS,
} from "@yamada-ui/react";
import * as React from "react";
import type { ClipboardEntry } from "~/utils/clipboard";
import { copyClipboardEntry, deleteClipboardEntry, editClipboardEntry, extractTextFromImage } from "~/utils/clipboard";
import { ColorPreview, ImagePreview, TextPreview } from "./preview";

interface DetailsPanelProps {
  selectedEntry: (ClipboardEntry & { count?: number }) | null;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = React.memo(({ selectedEntry }) => {
  const notice = useNotice({ isClosable: true, closeStrategy: "both" });

  const os = useOS();

  const { background } = useLoading();

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
    selectedEntry.type === "image" && selectedEntry.content && selectedEntry.content !== "[Extracting text...]";

  const handleReloadOCR = async () => {
    if (selectedEntry?.type !== "image" || !selectedEntry.content) return;
    try {
      background.start();
      // Try to extract base64 from file path if content is a file path
      const imagePath = isArray(selectedEntry.path) ? selectedEntry.path[0] : selectedEntry.path;

      if (!imagePath) {
        notice({
          title: "OCR Reload Failed",
          description: "No image path found",
          status: "error",
        });
        background.finish();
        return;
      }

      const pictureDirPath = await pictureDir();

      const text = await extractTextFromImage(`${pictureDirPath}/${imagePath}`);
      if (text !== "") {
        await editClipboardEntry(selectedEntry.timestamp, {
          content: text,
        });
        notice({
          title: "OCR Reloaded!",
          description: "Text re-extracted from image.",
          status: "success",
        });
      }
      background.finish();
    } catch (e) {
      notice({
        title: "OCR Reload Failed",
        description: String(e),
        status: "error",
      });
      background.finish();
    }
  };

  return (
    <Grid gridTemplateRows="1fr auto" px="sm" gap="sm" w="full">
      <GridItem position="relative">
        <ButtonGroup gap="sm" top="xs" right="xs" position="absolute">
          <IconButton
            size="sm"
            variant="surface"
            icon={selectedEntry.type === "image" ? <ImageIcon /> : <CopyIcon />}
            onClick={async () => {
              await copyClipboardEntry(selectedEntry, notice);
            }}
          />
          {os === "windows" && ocrCopyable && selectedEntry.content !== selectedEntry.path && (
            <IconButton
              aria-label="Copy OCR Text"
              icon={<TextIcon />}
              size="sm"
              variant="surface"
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
          {os === "windows" && selectedEntry.type === "image" && (
            <IconButton
              aria-label="Reload OCR"
              icon={<RefreshCwIcon />}
              size="sm"
              variant="surface"
              onClick={handleReloadOCR}
              title="Reload OCR Text"
            />
          )}
          {selectedEntry.type === "html" && (
            <IconButton
              aria-label="Copy Plain Text"
              icon={<TextIcon />}
              size="sm"
              variant="surface"
              onClick={async () => {
                await writeText(selectedEntry.content);
                notice({
                  title: "Plain text copied!",
                  description: "Plain text copied!",
                  status: "success",
                });
              }}
              title="Copy Plain Text"
            />
          )}
          <IconButton
            aria-label="Delete Entry"
            icon={<TrashIcon />}
            size="sm"
            variant="surface"
            colorScheme="danger"
            onClick={() => deleteClipboardEntry(selectedEntry.timestamp)}
          />
        </ButtonGroup>
        <ScrollArea maxH="calc(100vh - 70px - 160px)" maxW="calc(100vw - 25px - sm)" h="full">
          {selectedEntry.type === "image" && selectedEntry.path ? (
            <ImagePreview path={selectedEntry.path} />
          ) : selectedEntry.type === "color" ? (
            <ColorPreview color={selectedEntry.content} onCopy={() => copyClipboardEntry(selectedEntry, notice)} />
          ) : (
            <TextPreview content={selectedEntry.content} html={selectedEntry.html} />
          )}
        </ScrollArea>
      </GridItem>
      <GridItem>
        <DataList col={2} w="fit-content">
          <DataListItem>
            <DataListTerm>Copy Count</DataListTerm>
            <DataListDescription>{selectedEntry.count || 1} times</DataListDescription>
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
                {selectedEntry.type.charAt(0).toUpperCase() + selectedEntry.type.slice(1)}
              </Badge>
            </DataListDescription>
          </DataListItem>
          <DataListItem>
            <DataListTerm>First Copied</DataListTerm>
            <DataListDescription>{new Date(selectedEntry.timestamp).toLocaleString()}</DataListDescription>
          </DataListItem>
          <DataListItem>
            <DataListTerm>Application</DataListTerm>
            <DataListDescription>{selectedEntry.app?.replace(/\\/g, "/") || "Unknown"}</DataListDescription>
          </DataListItem>
        </DataList>
      </GridItem>
    </Grid>
  );
});

DetailsPanel.displayName = "DetailsPanel";
