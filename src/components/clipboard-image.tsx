import type { ImageProps } from "@yamada-ui/react";
import type { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { Image } from "@yamada-ui/react";
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
    staleTime: 60 * 1000, // 1 minute
  });

  return <Image src={data} h="full" w="full" objectFit="cover" {...rest} />;
});

ClipboardImage.displayName = "ClipboardImage";
