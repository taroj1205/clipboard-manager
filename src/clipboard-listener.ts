import { hasHTML, hasImage, hasText, onClipboardUpdate, readHtml, readImageBase64, readText } from "tauri-plugin-clipboard-api";
import { addClipboardEntry, base64ToUint8Array, editClipboardEntry, extractTextFromImage } from "./utils/clipboard";
import { isAppExcluded } from "./utils/excluded-apps";

import { invoke } from "@tauri-apps/api/core";
import { BaseDirectory, pictureDir } from "@tauri-apps/api/path";
import { writeFile } from "@tauri-apps/plugin-fs";
import { detectColorFormat } from "~/utils/color";

let prevText = "";
let prevImage = "";
let prevHTML = "";

function isColor(text: string): boolean {
  const format = detectColorFormat(text.trim());
  return format !== "invalid";
}

type ActiveWindowProps = {
  title: string;
  process_path: string;
  app_name: string;
  window_id: string;
  process_id: number;
};

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
            content: filename,
            type: "image",
            timestamp: now,
            path: filename,
            app: window.process_path,
          });
          // Extract text asynchronously and update entry
          try {
            const picturePath = await pictureDir();
            const ocrText = await extractTextFromImage(`${picturePath}/${filename}`);
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
            content: text,
            type,
            timestamp: now,
            app: windowExe,
            html,
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
            content: text,
            type,
            timestamp: now,
            app: windowExe,
          });
        } catch (err) {
          console.error("Failed to add clipboard entry:", err);
        }
      }
    }
  });
}
