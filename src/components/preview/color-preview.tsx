import { CopyIcon } from "@yamada-ui/lucide";
import {
  Box,
  Center,
  ColorSwatch,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  IconButton,
  useNotice,
  VStack,
} from "@yamada-ui/react";
import type { FC } from "react";
import { memo, useCallback } from "react";
import { writeText } from "tauri-plugin-clipboard-api";
import { useColorConverters } from "~/utils/color";

interface ColorPreviewProps {
  color: string;
  onCopy: () => void;
}

export const ColorPreview: FC<ColorPreviewProps> = memo(({ color, onCopy }) => {
  const { detectColorFormat, hexToHsl, hexToOklch, hexToRgb, normalizeColor } =
    useColorConverters();

  const notice = useNotice();

  const handleCopy = useCallback(
    (text: string) => {
      writeText(text);
      notice({
        status: "success",
        title: "Copied to clipboard",
        description: "Copied to clipboard",
      });
    },
    [notice]
  );

  const normalizedColor = normalizeColor(color);
  const originalFormat = detectColorFormat(color);
  const hex = hexToRgb(normalizedColor);
  const hsl = hexToHsl(normalizedColor);
  const oklch = hexToOklch(normalizedColor);
  const rgb = hexToRgb(normalizedColor);

  return (
    <Center as={VStack} flex={1} h="200px" pt="4xl">
      <Box position="relative">
        <ColorSwatch
          color={normalizedColor}
          h="120px"
          variant="rounded"
          w="120px"
        />
        <IconButton
          _hover={{
            opacity: 1,
          }}
          aria-label="Copy Color"
          colorScheme="blackAlpha"
          h="full"
          icon={<CopyIcon />}
          left="50%"
          onClick={onCopy}
          opacity={0}
          position="absolute"
          rounded="full"
          title="Copy Color"
          top="50%"
          transform="translate(-50%, -50%)"
          variant="solid"
          w="full"
        />
      </Box>
      <DataList alignSelf="flex-start" col={2}>
        <DataListItem cursor="pointer" onClick={() => handleCopy(color)}>
          <DataListTerm>Original ({originalFormat.toUpperCase()})</DataListTerm>
          <DataListDescription>{color}</DataListDescription>
        </DataListItem>
        <DataListItem cursor="pointer" onClick={() => handleCopy(hex)}>
          <DataListTerm>
            Hex{hex.length === 9 ? " (with Alpha)" : ""}
          </DataListTerm>
          <DataListDescription>{hex}</DataListDescription>
        </DataListItem>
        <DataListItem cursor="pointer" onClick={() => handleCopy(rgb)}>
          <DataListTerm>RGB{originalFormat === "rgba" ? "A" : ""}</DataListTerm>
          <DataListDescription>{rgb}</DataListDescription>
        </DataListItem>
        <DataListItem cursor="pointer" onClick={() => handleCopy(hsl)}>
          <DataListTerm>HSL{originalFormat === "hsla" ? "A" : ""}</DataListTerm>
          <DataListDescription>{hsl}</DataListDescription>
        </DataListItem>
        <DataListItem cursor="pointer" onClick={() => handleCopy(oklch)}>
          <DataListTerm>OKLCH</DataListTerm>
          <DataListDescription>{oklch}</DataListDescription>
        </DataListItem>
      </DataList>
    </Center>
  );
});

ColorPreview.displayName = "ColorPreview";
