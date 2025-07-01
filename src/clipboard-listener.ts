import { invoke } from '@tauri-apps/api/core';
import { BaseDirectory, pictureDir } from '@tauri-apps/api/path';
import { writeFile } from '@tauri-apps/plugin-fs';
import { useOS } from '@yamada-ui/react';
import {
  hasHTML,
  hasImage,
  hasText,
  onClipboardUpdate,
  readHtml,
  readImageBase64,
  readText,
} from 'tauri-plugin-clipboard-api';
import { detectColorFormat } from '~/utils/color';
import {
  addClipboardEntry,
  base64ToUint8Array,
  editClipboardEntry,
  extractTextFromImage,
} from './utils/clipboard';
import { isAppExcluded } from './utils/excluded-apps';

const PATH_SEPARATOR_REGEX = /[/\\]/;

let prevText = '';
let prevImage = '';
let prevHTML = '';

function isColor(text: string): boolean {
  const format = detectColorFormat(text.trim());
  return format !== 'invalid';
}

interface ActiveWindowProps {
  title: string;
  process_id: number;
  process_path: string;
  window_id: string;
  app_name: string;
}

async function getCurrentWindowInfo(): Promise<{
  windowExe: string;
  processPath: string;
} | null> {
  try {
    const window = (await invoke('get_current_window')) as ActiveWindowProps;
    const windowExe =
      window.process_path.split(PATH_SEPARATOR_REGEX).pop() ||
      window.process_path;

    if (windowExe === 'clipboard-manager.exe') {
      return null;
    }

    const isExcluded = await isAppExcluded(window.process_path);
    if (isExcluded) {
      return null;
    }

    return { windowExe, processPath: window.process_path };
  } catch (err) {
    console.error('Failed to get window info or check exclusions:', err);
    return null;
  }
}

async function handleImageClipboard(
  processPath: string,
  timestamp: number,
  os: string
): Promise<void> {
  const image = await readImageBase64();

  if (image.length > 1_000_000 || image === prevImage) {
    return;
  }

  prevImage = image;
  const filename = `clipboard-manager/${timestamp}.png`;

  try {
    await writeFile(filename, base64ToUint8Array(image), {
      baseDir: BaseDirectory.Picture,
    });

    await addClipboardEntry({
      app: processPath,
      path: filename,
      timestamp,
      type: 'image',
      content: filename,
    });

    // Extract text asynchronously and update entry
    try {
      const picturePath = await pictureDir();
      const ocrText = await extractTextFromImage(
        `${picturePath}/${filename}`,
        os
      );
      if (ocrText) {
        await editClipboardEntry(timestamp, { content: ocrText });
      }
    } catch (err) {
      console.error('OCR failed', err);
    }
  } catch (err) {
    console.error('Failed to save image:', err);
  }
}

async function handleHtmlClipboard(
  windowExe: string,
  timestamp: number
): Promise<void> {
  const html = await readHtml();
  const text = await readText();

  if (!html || html === prevHTML) {
    return;
  }

  prevHTML = html;
  const type = isColor(text) ? 'color' : 'html';

  try {
    await addClipboardEntry({
      app: windowExe,
      html,
      timestamp,
      type,
      content: text,
    });
  } catch (err) {
    console.error('Failed to add clipboard entry:', err);
  }
}

async function handleTextClipboard(
  windowExe: string,
  timestamp: number
): Promise<void> {
  const text = await readText();

  if (!text || text === prevText) {
    return;
  }

  prevText = text;
  const type = isColor(text) ? 'color' : 'text';

  try {
    await addClipboardEntry({
      app: windowExe,
      timestamp,
      type,
      content: text,
    });
  } catch (err) {
    console.error('Failed to add clipboard entry:', err);
  }
}

export function initClipboardListener() {
  onClipboardUpdate(async () => {
    const now = Date.now();
    const os = useOS();

    const windowInfo = await getCurrentWindowInfo();
    if (!windowInfo) {
      return;
    }

    const { windowExe, processPath } = windowInfo;

    if (await hasImage()) {
      await handleImageClipboard(processPath, now, os);
    } else if (await hasHTML()) {
      await handleHtmlClipboard(windowExe, now);
    } else if (await hasText()) {
      await handleTextClipboard(windowExe, now);
    }
  });
}
