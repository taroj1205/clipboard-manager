import { invoke } from "@tauri-apps/api/core";
import { BaseDirectory, pictureDir } from "@tauri-apps/api/path";
import { writeFile } from "@tauri-apps/plugin-fs";
import { useOS } from "@yamada-ui/react";
import {
  hasHTML,
  hasImage,
  hasText,
  onClipboardUpdate,
  readHtml,
  readImageBase64,
  readText,
} from "tauri-plugin-clipboard-api";
import { detectColorFormat } from "~/utils/color";
import { addClipboardEntry, base64ToUint8Array, editClipboardEntry, extractTextFromImage } from "./utils/clipboard";
import { isAppExcluded } from "./utils/excluded-apps";

let prevText = "";
let prevImage = "";
let prevHTML = "";

function isColor(text: string): boolean {
  const format = detectColorFormat(text.trim());
  return format !== "invalid";
}

interface ActiveWindowProps {
  title: string;
  process_id: number;
  process_path: string;
  window_id: string;
  app_name: string;
}

export function initClipboardListener() {
  onClipboardUpdate(async () => {
    const now = Date.now();
    let window: ActiveWindowProps;
    try {
      window = (await invoke("get_current_window")) as ActiveWindowProps;
    } catch (err) {
      console.error("Failed to get current window:", err);
      return;
    }
    // const windowTitle = window.title;
    const windowExe = window.process_path.split(/[/\\]/).pop() || window.process_path;
    if (windowExe === "clipboard-manager.exe") {
      return;
    }

    // Check if the current window's path is excluded
    try {
      const isExcluded = await isAppExcluded(window.process_path);
      if (isExcluded) {
        return;
      }
    } catch (err) {
      console.error("Failed to check excluded apps:", err);
      // Continue processing if exclusion check fails
    }
    if (await hasImage()) {
      const image = await readImageBase64();
      // if image is too big, skip
      if (image.length > 1000000) {
        return;
      }
      if (image && image !== prevImage) {
        prevImage = image;
        // save image to file
        const filename = `clipboard-manager/${now}.png`;
        try {
          await writeFile(filename, base64ToUint8Array(image), {
            baseDir: BaseDirectory.Picture,
          });
          await addClipboardEntry({
            app: window.process_path,
            path: filename,
            timestamp: now,
            type: "image",
            content: filename,
          });
          // Extract text asynchronously and update entry
          try {
            const picturePath = await pictureDir();
            const os = useOS();
            const ocrText = await extractTextFromImage(`${picturePath}/${filename}`, os);
            if (ocrText) {
              await editClipboardEntry(now, { content: ocrText });
            }
          } catch (err) {
            console.error("OCR failed", err);
          }
        } catch (err) {
          console.error("Failed to save image:", err);
        }
      }
    } else if (await hasHTML()) {
      const html = await readHtml();
      const text = await readText();
      if (html && html !== prevHTML) {
        prevHTML = html;
        const type = isColor(text) ? "color" : "html";
        try {
          await addClipboardEntry({
            app: windowExe,
            html,
            timestamp: now,
            type,
            content: text,
          });
        } catch (err) {
          console.error("Failed to add clipboard entry:", err);
        }
      }
    } else if (await hasText()) {
      const text = await readText();
      if (text && text !== prevText) {
        prevText = text;
        const type = isColor(text) ? "color" : "text";
        try {
          await addClipboardEntry({
            app: windowExe,
            timestamp: now,
            type,
            content: text,
          });
        } catch (err) {
          console.error("Failed to add clipboard entry:", err);
        }
      }
    }
  });
}
