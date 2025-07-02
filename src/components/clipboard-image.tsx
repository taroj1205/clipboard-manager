import { useQuery } from "@tanstack/react-query";
import type { ImageProps } from "@yamada-ui/react";
import { Image } from "@yamada-ui/react";
import type { FC } from "react";
import { memo } from "react";
import { getImageDataUrl } from "~/utils/image";

type ClipboardImageProps = ImageProps & {
  src: string;
};

export const ClipboardImage: FC<ClipboardImageProps> = memo((props) => {
  const { src, ...rest } = props;

  const { data } = useQuery({
    queryFn: async () => getImageDataUrl(src),
    queryKey: ["clipboard-image", src],
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return <Image h="fit-content" src={data} w="full" {...rest} />;
});

ClipboardImage.displayName = "ClipboardImage";
