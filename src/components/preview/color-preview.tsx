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
  VStack,
  useNotice,
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
  const { hexToRgb, hexToHsl, hexToOklch, normalizeColor, detectColorFormat } = useColorConverters();

  const notice = useNotice();

  const handleCopy = useCallback(
    (text: string) => {
      writeText(text);
      notice({
        title: "Copied to clipboard",
        description: "Copied to clipboard",
        status: "success",
      });
    },
    [notice],
  );

  const normalizedColor = normalizeColor(color);
  const originalFormat = detectColorFormat(color);
  const hex = hexToRgb(normalizedColor);
  const hsl = hexToHsl(normalizedColor);
  const oklch = hexToOklch(normalizedColor);
  const rgb = hexToRgb(normalizedColor);

  return (
    <Center h="200px" flex={1} as={VStack} pt="4xl">
      <Box position="relative">
        <ColorSwatch color={normalizedColor} variant="rounded" h="120px" w="120px" />
        <IconButton
          aria-label="Copy Color"
          icon={<CopyIcon />}
          h="full"
          w="full"
          variant="solid"
          colorScheme="blackAlpha"
          position="absolute"
          rounded="full"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          opacity={0}
          _hover={{
            opacity: 1,
          }}
          onClick={onCopy}
          title="Copy Color"
        />
      </Box>
      <DataList col={2} alignSelf="flex-start">
        <DataListItem onClick={() => handleCopy(color)} cursor="pointer">
          <DataListTerm>Original ({originalFormat.toUpperCase()})</DataListTerm>
          <DataListDescription>{color}</DataListDescription>
        </DataListItem>
        <DataListItem onClick={() => handleCopy(hex)} cursor="pointer">
          <DataListTerm>Hex{hex.length === 9 ? " (with Alpha)" : ""}</DataListTerm>
          <DataListDescription>{hex}</DataListDescription>
        </DataListItem>
        <DataListItem onClick={() => handleCopy(rgb)} cursor="pointer">
          <DataListTerm>RGB{originalFormat === "rgba" ? "A" : ""}</DataListTerm>
          <DataListDescription>{rgb}</DataListDescription>
        </DataListItem>
        <DataListItem onClick={() => handleCopy(hsl)} cursor="pointer">
          <DataListTerm>HSL{originalFormat === "hsla" ? "A" : ""}</DataListTerm>
          <DataListDescription>{hsl}</DataListDescription>
        </DataListItem>
        <DataListItem onClick={() => handleCopy(oklch)} cursor="pointer">
          <DataListTerm>OKLCH</DataListTerm>
          <DataListDescription>{oklch}</DataListDescription>
        </DataListItem>
      </DataList>
    </Center>
  );
});

ColorPreview.displayName = "ColorPreview";
