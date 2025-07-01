import { Text } from '@yamada-ui/react';
import type { FC } from 'react';
import { memo } from 'react';

interface TextPreviewProps {
  content: string;
  html?: string;
}

export const TextPreview: FC<TextPreviewProps> = memo(({ html, content }) => {
  return (
    <Text data-html={html} whiteSpace="pre-wrap" wordBreak="break-word">
      {content}
    </Text>
  );
});

TextPreview.displayName = 'TextPreview';
