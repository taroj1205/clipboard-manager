import { Center } from "@yamada-ui/react";
import type { FC } from "react";
import { memo } from "react";
import { ClipboardImage } from "../clipboard-image";

interface ImagePreviewProps {
  path: string | string[];
}

export const ImagePreview: FC<ImagePreviewProps> = memo(({ path }) => {
  return (
    <Center w="full">
      <ClipboardImage
        maxH="100%"
        maxW="100%"
        objectFit="contain"
        src={Array.isArray(path) ? path[0] : path}
      />
    </Center>
  );
});

ImagePreview.displayName = "ImagePreview";
