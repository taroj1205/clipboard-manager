import { BaseDirectory, readFile } from "@tauri-apps/plugin-fs";
import { uint8ArrayToBase64 } from "./clipboard";

export async function getImageDataUrl(
  src: string,
): Promise<string | undefined> {
  const data = await readFile(src, { baseDir: BaseDirectory.Picture });
  if (data) {
    return `data:image/png;base64,${uint8ArrayToBase64(data)}`;
  }
  return undefined;
}
