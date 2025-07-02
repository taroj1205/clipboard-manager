import { convertFileSrc } from "@tauri-apps/api/core";
import { pictureDir } from "@tauri-apps/api/path";

export async function getImageDataUrl(
  src: string
): Promise<string | undefined> {
  try {
    // Get the pictures directory path
    const pictureDirPath = await pictureDir();
    // Create the full file path (src is relative like "clipboard-manager/timestamp.png")
    const fullPath = `${pictureDirPath}/${src}`;
    // Convert to asset URL that can be used directly in img src
    return convertFileSrc(fullPath);
  } catch (e) {
    console.error("Failed to convert file src:", e);
    return;
  }
}
