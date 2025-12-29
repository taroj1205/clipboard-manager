import { pictureDir } from "@tauri-apps/api/path";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import {
  CopyIcon,
  ImageIcon,
  RefreshCwIcon,
  TextIcon,
  TrashIcon,
} from "@yamada-ui/lucide";
import {
  Badge,
  ButtonGroup,
  Center,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
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
import { memo } from "react";
import type { ClipboardEntry } from "~/utils/clipboard";
import {
  copyClipboardEntry,
  deleteClipboardEntry,
  editClipboardEntry,
  extractTextFromImage,
} from "~/utils/clipboard";
import { ColorPreview, ImagePreview, TextPreview } from "./preview";

interface DetailsPanelProps {
  selectedEntry: (ClipboardEntry & { count?: number }) | null;
}

const getBadgeColorScheme = (type: string): string => {
  if (type === "text") {
    return "purple";
  }
  if (type === "image") {
    return "blue";
  }
  if (type === "color") {
    return "yellow";
  }
  return "gray";
};

const renderPreviewContent = (
  selectedEntry: ClipboardEntry & { count?: number },
  notice: ReturnType<typeof useNotice>
) => {
  if (selectedEntry.type === "image" && selectedEntry.path) {
    return <ImagePreview path={selectedEntry.path} />;
  }

  if (selectedEntry.type === "color") {
    return (
      <ColorPreview
        color={selectedEntry.content}
        onCopy={() => copyClipboardEntry(selectedEntry, notice)}
      />
    );
  }

  if (selectedEntry.type === "html" && selectedEntry.html) {
    const htmlWithTransparentBg = `
      <style>
        :root {
          color-scheme: dark;
        }
        html, body {
          background: transparent !important;
          margin: 0;
          padding: 8px;
        }
        * {
          max-width: 100% !important;
          white-space: pre-wrap !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
        }
      </style>
      ${selectedEntry.html}
    `;

    return (
      <Flex
        as="iframe"
        bg="transparent"
        flex={1}
        h="100%"
        overflowWrap="break-word"
        srcDoc={htmlWithTransparentBg}
        w="100%"
        wordBreak="break-word"
      />
    );
  }

  return (
    <TextPreview content={selectedEntry.content} html={selectedEntry.html} />
  );
};

export const DetailsPanel: React.FC<DetailsPanelProps> = memo(
  ({ selectedEntry }) => {
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
      selectedEntry.type === "image" &&
      selectedEntry.content &&
      selectedEntry.content !== "[Extracting text...]";

    const handleReloadOCR = async () => {
      if (selectedEntry.type !== "image" || !selectedEntry.content) {
        return;
      }
      try {
        background.start();
        const imagePath = isArray(selectedEntry.path)
          ? selectedEntry.path[0]
          : selectedEntry.path;

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

        const text = await extractTextFromImage(
          `${pictureDirPath}/${imagePath}`,
          os
        );
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
      <Grid gap="sm" gridTemplateRows="1fr auto" h="full" px="sm" w="full">
        <GridItem minW={0} position="relative">
          <ButtonGroup gap="sm" position="absolute" right="xs" top="xs">
            <IconButton
              icon={
                selectedEntry.type === "image" ? <ImageIcon /> : <CopyIcon />
              }
              onClick={async () => {
                await copyClipboardEntry(selectedEntry, notice);
              }}
              size="sm"
              variant="surface"
            />
            {os === "windows" &&
            ocrCopyable &&
            selectedEntry.content !== selectedEntry.path ? (
              <IconButton
                aria-label="Copy OCR Text"
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
                size="sm"
                title="Copy OCR Text"
                variant="surface"
              />
            ) : null}
            {os === "windows" && selectedEntry.type === "image" && (
              <IconButton
                aria-label="Reload OCR"
                icon={<RefreshCwIcon />}
                onClick={handleReloadOCR}
                size="sm"
                title="Reload OCR Text"
                variant="surface"
              />
            )}
            {selectedEntry.type === "html" && (
              <IconButton
                aria-label="Copy Plain Text"
                icon={<TextIcon />}
                onClick={async () => {
                  await writeText(selectedEntry.content);
                  notice({
                    status: "success",
                    title: "Plain text copied!",
                    description: "Plain text copied!",
                  });
                }}
                size="sm"
                title="Copy Plain Text"
                variant="surface"
              />
            )}
            <IconButton
              aria-label="Delete Entry"
              colorScheme="danger"
              icon={<TrashIcon />}
              onClick={async () =>
                deleteClipboardEntry(selectedEntry.timestamp)
              }
              size="sm"
              variant="surface"
            />
          </ButtonGroup>
          <ScrollArea
            h="full"
            maxH="calc(100vh - 70px - 160px)"
            overflowX="hidden"
            w="full"
          >
            {renderPreviewContent(selectedEntry, notice)}
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
                <Badge colorScheme={getBadgeColorScheme(selectedEntry.type)}>
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
                {selectedEntry.app
                  ? selectedEntry.app.replace(/\\/g, "/")
                  : "Unknown"}
              </DataListDescription>
            </DataListItem>
          </DataList>
        </GridItem>
      </Grid>
    );
  }
);

DetailsPanel.displayName = "DetailsPanel";
