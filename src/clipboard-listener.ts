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
import {
  addClipboardEntry,
  base64ToUint8Array,
  editClipboardEntry,
  extractTextFromImage,
} from "./utils/clipboard";
import { isAppExcluded } from "./utils/excluded-apps";

const regex = /[/\\]/;

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

async function getCurrentWindowInfo(): Promise<ActiveWindowProps | null> {
  try {
    const window = (await invoke("get_current_window")) as ActiveWindowProps;
    const windowExe =
      window.process_path.split(regex).pop() || window.process_path;

    if (windowExe === "clipboard-manager.exe") {
      return null;
    }

    const isExcluded = await isAppExcluded(window.process_path);
    if (isExcluded) {
      return null;
    }

    return window;
  } catch (err) {
    console.error("Failed to get current window:", err);
    return null;
  }
}

async function handleImageClipboard(
  window: ActiveWindowProps,
  now: number,
  os: string
) {
  const image = await readImageBase64();
  if (image.length > 1_000_000 || !image || image === prevImage) {
    return;
  }

  prevImage = image;
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

    try {
      const picturePath = await pictureDir();
      const ocrText = await extractTextFromImage(
        `${picturePath}/${filename}`,
        os
      );
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

async function handleHtmlClipboard(window: ActiveWindowProps, now: number) {
  const html = await readHtml();
  if (!html || html === prevHTML) {
    return;
  }

  prevHTML = html;
  const text = await readText();
  const type = isColor(text) ? "color" : "html";
  const windowExe =
    window.process_path.split(regex).pop() || window.process_path;

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

async function handleTextClipboard(window: ActiveWindowProps, now: number) {
  const text = await readText();
  if (!text || text === prevText) {
    return;
  }

  prevText = text;
  const type = isColor(text) ? "color" : "text";
  const windowExe =
    window.process_path.split(regex).pop() || window.process_path;

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

export function initClipboardListener() {
  const os = useOS();

  onClipboardUpdate(async () => {
    const now = Date.now();
    const window = await getCurrentWindowInfo();

    if (!window) {
      return;
    }

    if (await hasImage()) {
      await handleImageClipboard(window, now, os);
    } else if (await hasHTML()) {
      await handleHtmlClipboard(window, now);
    } else if (await hasText()) {
      await handleTextClipboard(window, now);
    }
  });
}
