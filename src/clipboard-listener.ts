import {
  onClipboardUpdate,
  hasText,
  hasImage,
  readText,
  readImageBase64,
} from "tauri-plugin-clipboard-api";
import { addClipboardEntry, editClipboardEntry } from "./utils/clipboard";
import Tesseract from "tesseract.js";
import { emit } from "@tauri-apps/api/event";

import { invoke } from "@tauri-apps/api/core";
import { join, resourceDir } from "@tauri-apps/api/path";

let prevText = "";
let prevImage = "";

function isColorCode(text: string): boolean {
  return /^(#[0-9A-Fa-f]{3,8}|rgb\(.*\)|rgba\(.*\)|hsl\(.*\)|hsla\(.*\))$/.test(
    text.trim()
  );
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
    const window = (await invoke("get_current_window")) as ActiveWindowProps;
    // const windowTitle = window.title;
    const windowExe =
      window.process_path.split(/[/\\]/).pop() || window.process_path;
    if (windowExe === "clipboard-manager.exe") {
      return;
    }
    if (await hasImage()) {
      console.log("Image detected");
      const image = await readImageBase64();
      if (image && image !== prevImage) {
        prevImage = image;
        // save image to file
        const filename = `assets/${now}.png`;

        console.log("Image saved to file");
        const resourceDirPath = await resourceDir();
        const filePath = await join(resourceDirPath, filename);
        await invoke("write_file", {
          path: filePath,
          data: image,
          app: windowExe,
        });
        // Add entry with placeholder content
        await addClipboardEntry({
          content: "[Extracting text...]",
          type: "image",
          timestamp: now,
          path: filePath,
          app: windowExe,
        });
        emit("clipboard-entry-added");
        // Extract text asynchronously and update entry
        try {
          console.log("Tesseract.recognize");
          const result = await Tesseract.recognize(
            `data:image/png;base64,${image}`,
            "eng"
          );
          const ocrText = result.data.text.trim();
          await editClipboardEntry(now, { content: ocrText || "[Image]" });
        } catch (err) {
          console.error("OCR failed", err);
        }
      }
    } else if (await hasText()) {
      const text = await readText();
      if (text && text !== prevText) {
        prevText = text;
        const type = isColorCode(text) ? "color" : "text";
        await addClipboardEntry({
          content: text,
          type,
          timestamp: now,
          app: windowExe,
        });
        emit("clipboard-entry-added");
      }
    }
  });
}
