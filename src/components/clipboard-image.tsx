import { useQuery } from "@tanstack/react-query";
import { readFile } from "@tauri-apps/plugin-fs";
import { ImageProps, Image } from "@yamada-ui/react";
import { FC, memo } from "react";
import { uint8ArrayToBase64 } from "../utils/clipboard";

type ClipboardImageProps = ImageProps & {
  src: string;
};

export const ClipboardImage: FC<ClipboardImageProps> = memo((props) => {
  const { src, ...rest } = props;

  const { data } = useQuery({
    queryKey: ["clipboard-image", src],
    queryFn: () => readFile(src),
  });

  let imageSrc = undefined;
  if (data) {
    imageSrc = `data:image/png;base64,${uint8ArrayToBase64(
      data as Uint8Array
    )}`;
  }

  return <Image src={imageSrc} objectFit="contain" {...rest} />;
});
