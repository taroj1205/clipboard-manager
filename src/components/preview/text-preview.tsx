import { Text } from "@yamada-ui/react";
import type { FC } from "react";
import { memo } from "react";

interface TextPreviewProps {
  content: string;
  html?: string;
}

export const TextPreview: FC<TextPreviewProps> = memo(({ content, html }) => {
  return (
    <Text whiteSpace="pre-wrap" wordBreak="break-word" data-html={html}>
      {content}
    </Text>
  );
});

TextPreview.displayName = "TextPreview";
