import { useQuery } from "@tanstack/react-query";
import { Image, type ImageProps } from "@yamada-ui/react";
import { type FC, memo } from "react";
import { getImageDataUrl } from "~/utils/image";

type ClipboardImageProps = ImageProps & {
  src: string;
};

export const ClipboardImage: FC<ClipboardImageProps> = memo((props) => {
  const { src, ...rest } = props;

  const { data } = useQuery({
    queryKey: ["clipboard-image", src],
    queryFn: () => getImageDataUrl(src),
  });

  return <Image src={data} w="full" h="full" objectFit="cover" {...rest} />;
});
