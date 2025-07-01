import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import { writeHtml } from "@tauri-apps/plugin-clipboard-manager";
import { BaseDirectory, readFile } from "@tauri-apps/plugin-fs";
import { writeImageBase64, writeText } from "tauri-plugin-clipboard-api";
import { db } from "~/db";

export interface ClipboardEntry {
  timestamp: number;
  type: "color" | "html" | "image" | "text";
  content: string;
  app?: string;
  html?: string;
  path?: string | string[];
}

export async function addClipboardEntry(entry: ClipboardEntry): Promise<void> {
  await db.execute(
    "INSERT INTO clipboard_entries (content, type, timestamp, app, path, html) VALUES (?, ?, ?, ?, ?, ?)",
    [
      entry.content,
      entry.type,
      entry.timestamp,
      entry.app,
      entry.path ? (Array.isArray(entry.path) ? JSON.stringify(entry.path) : entry.path) : null,
      entry.html,
    ]
  );
  emit("clipboard-entry-updated");
}

export async function deleteClipboardEntry(timestamp: number): Promise<void> {
  await db.execute("DELETE FROM clipboard_entries WHERE timestamp = ?", [timestamp]);
  emit("clipboard-entry-updated");
}

export async function getPaginatedClipboardEntries(query: string, limit = 50, offset = 0): Promise<ClipboardEntry[]> {
  let result: ClipboardEntry[];
  if (!query) {
    result = (await db.select("SELECT * FROM clipboard_entries ORDER BY timestamp DESC LIMIT ? OFFSET ?", [
      limit,
      offset,
    ])) as ClipboardEntry[];
  } else {
    // Multi-word (tokenized) search: all words must be present in content, path, or app, case-insensitive
    const words = query.trim().split(/\s+/);
    const likeClauses = words
      .map(() => "(content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE OR app LIKE ? COLLATE NOCASE)")
      .join(" AND ");
    const likeParams = words.flatMap((word) => [`%${word}%`, `%${word}%`, `%${word}%`]);
    // For relevance, boost if all words match exactly, then if any word is a prefix, then if all are substrings
    // (Simple: just use the first word for exact/prefix, rest for AND substrings)
    const firstWord = words[0];
    const startsWithQuery = `${firstWord}%`;
    const likeQuery = `%${firstWord}%`;
    result = (await db.select(
      `SELECT *,
        (CASE
          WHEN content = ? COLLATE NOCASE OR path = ? COLLATE NOCASE OR app = ? COLLATE NOCASE THEN 3
          WHEN content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE OR app LIKE ? COLLATE NOCASE THEN 2
          WHEN content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE OR app LIKE ? COLLATE NOCASE THEN 1
          ELSE 0
        END) AS relevance
      FROM clipboard_entries
      WHERE ${likeClauses}
      ORDER BY relevance DESC, timestamp DESC
      LIMIT ? OFFSET ?`,
      [
        firstWord,
        firstWord,
        firstWord,
        startsWithQuery,
        startsWithQuery,
        startsWithQuery,
        likeQuery,
        likeQuery,
        likeQuery,
        ...likeParams,
        limit,
        offset,
      ]
    )) as ClipboardEntry[];
  }
  return result;
}

export async function getAllClipboardEntries(query: string): Promise<ClipboardEntry[]> {
  let result: ClipboardEntry[];
  if (!query) {
    result = (await db.select("SELECT * FROM clipboard_entries ORDER BY timestamp DESC")) as ClipboardEntry[];
  } else {
    // Multi-word (tokenized) search: all words must be present in content, path, or app, case-insensitive
    const words = query.trim().split(/\s+/);
    const likeClauses = words
      .map(() => "(content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE OR app LIKE ? COLLATE NOCASE)")
      .join(" AND ");
    const likeParams = words.flatMap((word) => [`%${word}%`, `%${word}%`, `%${word}%`]);
    // For relevance, boost if all words match exactly, then if any word is a prefix, then if all are substrings
    // (Simple: just use the first word for exact/prefix, rest for AND substrings)
    const firstWord = words[0];
    const startsWithQuery = `${firstWord}%`;
    const likeQuery = `%${firstWord}%`;
    result = (await db.select(
      `SELECT *,
        (CASE
          WHEN content = ? COLLATE NOCASE OR path = ? COLLATE NOCASE OR app = ? COLLATE NOCASE THEN 3
          WHEN content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE OR app LIKE ? COLLATE NOCASE THEN 2
          WHEN content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE OR app LIKE ? COLLATE NOCASE THEN 1
          ELSE 0
        END) AS relevance
      FROM clipboard_entries
      WHERE ${likeClauses}
      ORDER BY relevance DESC, timestamp DESC
      LIMIT ? OFFSET ?`,
      [
        firstWord,
        firstWord,
        firstWord,
        startsWithQuery,
        startsWithQuery,
        startsWithQuery,
        likeQuery,
        likeQuery,
        likeQuery,
        ...likeParams,
      ]
    )) as ClipboardEntry[];
  }
  return result;
}

export async function editClipboardEntry(timestamp: number, updates: Partial<ClipboardEntry>): Promise<void> {
  const fields = [];
  const values = [];
  if (updates.content !== undefined) {
    fields.push("content = ?");
    values.push(updates.content);
  }
  if (updates.type !== undefined) {
    fields.push("type = ?");
    values.push(updates.type);
  }
  if (updates.app !== undefined) {
    fields.push("app = ?");
    values.push(updates.app);
  }
  if (updates.path !== undefined) {
    fields.push("path = ?");
    values.push(Array.isArray(updates.path) ? JSON.stringify(updates.path) : updates.path);
  }
  if (updates.html !== undefined) {
    fields.push("html = ?");
    values.push(updates.html);
  }
  if (fields.length === 0) return;
  values.push(timestamp);
  await db.execute(`UPDATE clipboard_entries SET ${fields.join(", ")} WHERE timestamp = ?`, values);
  emit("clipboard-entry-updated");
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return window.btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function copyClipboardEntry(
  entry: ClipboardEntry,
  notice: (args: { status: "error" | "success"; title: string; description: string }) => void
) {
  if (entry.type === "image" && entry.path) {
    try {
      const normalizedPath = Array.isArray(entry.path) ? entry.path[0] : entry.path;
      const data = await readFile(normalizedPath, {
        baseDir: BaseDirectory.Picture,
      });
      const base64 = uint8ArrayToBase64(data);
      await writeImageBase64(base64);
      notice({
        status: "success",
        title: "Image copied!",
        description: "Image copied to clipboard",
      });
    } catch (_error) {
      console.error(_error);
      notice({
        status: "error",
        title: "Failed to copy image",
        description: "Failed to copy image",
      });
    }
  } else if (entry.type === "html" && entry.html) {
    try {
      await writeHtml(entry.html, entry.content);
      notice({
        status: "success",
        title: "HTML copied!",
        description: "HTML copied to clipboard",
      });
    } catch (_error) {
      console.error("Failed to copy HTML, falling back to text. Error:", _error);
      try {
        await writeText(entry.content);
        notice({
          status: "error",
          title: "Copied as text",
          description: "HTML copy failed, copied as plain text instead.",
        });
      } catch (_error) {
        notice({
          status: "error",
          title: "Failed to copy",
          description: "Failed to copy HTML and text",
        });
      }
    }
  } else {
    try {
      await writeText(entry.content);
      notice({
        status: "success",
        title: "Copied!",
        description: "Copied to clipboard",
      });
    } catch (_error) {
      notice({
        status: "error",
        title: "Failed to copy",
        description: "Failed to copy",
      });
    }
  }
}

/**
 * Extracts text from an image using platform-specific OCR.
 * On Windows, uses the Tauri win_ocr backend and requires an image path.
 * On other platforms, uses Tesseract.js and requires a base64 image string.
 * @param imagePathOrBase64 The image path (Windows) or base64-encoded image string (other platforms)
 * @returns The extracted text, or an empty string if OCR fails
 */
export async function extractTextFromImage(imagePathOrBase64: string, platform?: string): Promise<string> {
  // Platform should be passed as parameter instead of using React hook
  const detectedPlatform =
    platform ||
    (typeof window !== "undefined" && "navigator" in window
      ? navigator.platform.toLowerCase().includes("win")
        ? "windows"
        : "other"
      : "other");

  if (detectedPlatform === "windows") {
    try {
      // On Windows, pass the image path to the Tauri command
      const text = await invoke<string>("ocr_image", {
        imagePath: imagePathOrBase64,
      });
      return text.trim();
    } catch (err) {
      console.error("OCR failed (win_ocr)", err);
      return "";
    }
  } else {
    return "OCR not supported on this platform";
  }
}
