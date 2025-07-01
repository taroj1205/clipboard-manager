import type { ClipboardEntry } from "~/utils/clipboard";
import { pictureDir } from "@tauri-apps/api/path";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Box, CopyIcon, ImageIcon, RefreshCwIcon, TextIcon, TrashIcon } from "@yamada-ui/lucide";
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
  isArray,
  ScrollArea,
  Text,
  useLoading,
  useNotice,
  useOS,
} from "@yamada-ui/react";
import * as React from "react";
import { copyClipboardEntry, deleteClipboardEntry, editClipboardEntry, extractTextFromImage } from "~/utils/clipboard";
import { ImagePreview, TextPreview } from "./preview";

interface DetailsPanelProps {
  selectedEntry: (ClipboardEntry & { count?: number }) | null;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = React.memo(({ selectedEntry }) => {
  const notice = useNotice({ closeStrategy: "both", isClosable: true });

  const os = useOS();

  const { background } = useLoading();

  if (!selectedEntry) {
    return (
      <Center flex={1}>
        <Text color="muted" fontSize="xl">
          Select an entry to see details
        </Text>
      </Center>
    );
  }

  const ocrCopyable =
    selectedEntry.type === "image" && selectedEntry.content && selectedEntry.content !== "[Extracting text...]";

  const handleReloadOCR = async () => {
    if (selectedEntry.type !== "image" || !selectedEntry.content) return;
    try {
      background.start();
      // Try to extract base64 from file path if content is a file path
      const imagePath = isArray(selectedEntry.path) ? selectedEntry.path[0] : selectedEntry.path;

      if (!imagePath) {
        notice({
          status: "error",
          title: "OCR Reload Failed",
          description: "No image path found",
        });
        background.finish();
        return;
      }

      const pictureDirPath = await pictureDir();

      const text = await extractTextFromImage(`${pictureDirPath}/${imagePath}`, os);
      if (text !== "") {
        await editClipboardEntry(selectedEntry.timestamp, {
          content: text,
        });
        notice({
          status: "success",
          title: "OCR Reloaded!",
          description: "Text re-extracted from image.",
        });
      }
      background.finish();
    } catch (_error) {
      notice({
        status: "error",
        title: "OCR Reload Failed",
        description: String(_error),
      });
      background.finish();
    }
  };

  return (
    <Grid gap="sm" px="sm" w="full" gridTemplateRows="1fr auto">
      <GridItem position="relative">
        <ButtonGroup gap="sm" right="xs" position="absolute" top="xs">
          <IconButton
            size="sm"
            variant="surface"
            icon={selectedEntry.type === "image" ? <ImageIcon /> : <CopyIcon />}
            onClick={async () => {
              await copyClipboardEntry(selectedEntry, notice);
            }}
          />
          {os === "windows" && ocrCopyable && selectedEntry.content !== selectedEntry.path ? (
            <IconButton
              size="sm"
              aria-label="Copy OCR Text"
              variant="surface"
              title="Copy OCR Text"
              icon={<TextIcon />}
              onClick={async () => {
                try {
                  await writeText(selectedEntry.content);
                  notice({
                    status: "success",
                    title: "OCR text copied!",
                    description: "OCR text copied!",
                  });
                } catch (_error) {
                  notice({
                    status: "error",
                    title: "Failed to copy OCR text",
                    description: "Failed to copy OCR text",
                  });
                }
              }}
            />
          ) : null}
          {os === "windows" && selectedEntry.type === "image" && (
            <IconButton
              size="sm"
              aria-label="Reload OCR"
              variant="surface"
              title="Reload OCR Text"
              icon={<RefreshCwIcon />}
              onClick={handleReloadOCR}
            />
          )}
          {selectedEntry.type === "html" && (
            <IconButton
              size="sm"
              aria-label="Copy Plain Text"
              variant="surface"
              title="Copy Plain Text"
              icon={<TextIcon />}
              onClick={async () => {
                await writeText(selectedEntry.content);
                notice({
                  status: "success",
                  title: "Plain text copied!",
                  description: "Plain text copied!",
                });
              }}
            />
          )}
          <IconButton
            size="sm"
            aria-label="Delete Entry"
            variant="surface"
            colorScheme="danger"
            icon={<TrashIcon />}
            onClick={async () => deleteClipboardEntry(selectedEntry.timestamp)}
          />
        </ButtonGroup>
        <ScrollArea maxH="calc(100vh - 70px - 160px)" maxW="calc(100vw - 25px - sm)">
          {selectedEntry.type === "image" && selectedEntry.path ? (
            <ImagePreview path={selectedEntry.path} />
          ) : selectedEntry.type === "color" ? (
            <Center h="200px">
              <Box
                className="group"
                alignItems="center"
                bg={selectedEntry.content}
                display="flex"
                h="120px"
                w="120px"
                borderColor="gray.300"
                borderRadius="full"
                borderWidth="2px"
                boxShadow="md"
                justifyContent="center"
                position="relative"
              >
                <IconButton
                  size="lg"
                  aria-label="Copy Color"
                  variant="solid"
                  left="50%"
                  title="Copy Color"
                  _groupHover={{
                    opacity: 1,
                  }}
                  colorScheme="blackAlpha"
                  icon={<CopyIcon />}
                  onClick={() => {
                    copyClipboardEntry(selectedEntry, notice);
                  }}
                  opacity={0}
                  position="absolute"
                  top="50%"
                  transform="translate(-50%, -50%)"
                />
              </Box>
            </Center>
          ) : selectedEntry.type === "html" && selectedEntry.html ? (
            <Text
              // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
              dangerouslySetInnerHTML={{ __html: selectedEntry.html }}
              wordBreak="break-word"
            />
          ) : (
            <TextPreview html={selectedEntry.html} content={selectedEntry.content} />
          )}
        </ScrollArea>
      </GridItem>
      <GridItem>
        <DataList w="fit-content" col={2}>
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
            <DataListDescription>
              {selectedEntry.app ? selectedEntry.app.replace(/\\/g, "/") : "Unknown"}
            </DataListDescription>
          </DataListItem>
        </DataList>
      </GridItem>
    </Grid>
  );
});

DetailsPanel.displayName = "DetailsPanel";
