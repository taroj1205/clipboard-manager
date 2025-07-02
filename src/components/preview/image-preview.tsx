import type { FC } from "react";
import { memo } from "react";
import { ClipboardImage } from "../clipboard-image";

interface ImagePreviewProps {
  path: string | string[];
}

export const ImagePreview: FC<ImagePreviewProps> = memo(({ path }) => {
  return (
    <ClipboardImage boxSize="xl" src={Array.isArray(path) ? path[0] : path} />
  );
});

ImagePreview.displayName = "ImagePreview";
