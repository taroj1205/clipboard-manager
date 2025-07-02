import { BaseDirectory, readFile } from "@tauri-apps/plugin-fs";
import { uint8ArrayToBase64 } from "./clipboard";

export async function getImageDataUrl(
  src: string
): Promise<string | undefined> {
  try {
    const data = await readFile(src, { baseDir: BaseDirectory.Picture });
    return `data:image/png;base64,${uint8ArrayToBase64(data)}`;
  } catch (e) {
    console.error(e);
  }
  return;
}
