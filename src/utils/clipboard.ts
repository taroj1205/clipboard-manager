import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import {
  writeHtml,
  writeImage,
  writeText,
} from "@tauri-apps/plugin-clipboard-manager";
import { BaseDirectory } from "@tauri-apps/plugin-fs";
import { readFile } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";
import { useOS } from "@yamada-ui/react";
import {
  convertUint8ArrayToBlob,
  writeImageBase64,
} from "tauri-plugin-clipboard-api";

export interface ClipboardEntry {
  content: string;
  type: string;
  timestamp: number;
  app?: string;
  path?: string | string[];
  html?: string;
}

const db = await Database.load("sqlite:clipboard.db");

export async function addClipboardEntry(entry: ClipboardEntry): Promise<void> {
  await db.execute(
    "INSERT INTO clipboard_entries (content, type, timestamp, app, path, html) VALUES (?, ?, ?, ?, ?, ?)",
    [
      entry.content,
      entry.type,
      entry.timestamp,
      entry.app,
      entry.path
        ? Array.isArray(entry.path)
          ? JSON.stringify(entry.path)
          : entry.path
        : null,
      entry.html,
    ]
  );
  emit("clipboard-entry-updated");
}

export async function getPaginatedClipboardEntries(
  query: string,
  limit = 50,
  offset = 0
): Promise<ClipboardEntry[]> {
  let result: ClipboardEntry[];
  if (!query) {
    result = (await db.select(
      "SELECT * FROM clipboard_entries ORDER BY timestamp DESC LIMIT ? OFFSET ?",
      [limit, offset]
    )) as ClipboardEntry[];
  } else {
    // Multi-word (tokenized) search: all words must be present in content or path, case-insensitive
    const words = query.trim().split(/\s+/);
    const likeClauses = words
      .map(
        () => "(content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE)"
      )
      .join(" AND ");
    const likeParams = words.flatMap((word) => [`%${word}%`, `%${word}%`]);
    // For relevance, boost if all words match exactly, then if any word is a prefix, then if all are substrings
    // (Simple: just use the first word for exact/prefix, rest for AND substrings)
    const firstWord = words[0];
    const startsWithQuery = `${firstWord}%`;
    const likeQuery = `%${firstWord}%`;
    result = (await db.select(
      `SELECT *,
        (CASE
          WHEN content = ? COLLATE NOCASE OR path = ? COLLATE NOCASE THEN 3
          WHEN content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE THEN 2
          WHEN content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE THEN 1
          ELSE 0
        END) AS relevance
      FROM clipboard_entries
      WHERE ${likeClauses}
      ORDER BY relevance DESC, timestamp DESC
      LIMIT ? OFFSET ?`,
      [
        firstWord,
        firstWord,
        startsWithQuery,
        startsWithQuery,
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

export async function getAllClipboardEntries(
  query: string
): Promise<ClipboardEntry[]> {
  let result: ClipboardEntry[];
  if (!query) {
    result = (await db.select(
      "SELECT * FROM clipboard_entries ORDER BY timestamp DESC"
    )) as ClipboardEntry[];
  } else {
    // Multi-word (tokenized) search: all words must be present in content or path, case-insensitive
    const words = query.trim().split(/\s+/);
    const likeClauses = words
      .map(
        () => "(content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE)"
      )
      .join(" AND ");
    const likeParams = words.flatMap((word) => [`%${word}%`, `%${word}%`]);
    // For relevance, boost if all words match exactly, then if any word is a prefix, then if all are substrings
    // (Simple: just use the first word for exact/prefix, rest for AND substrings)
    const firstWord = words[0];
    const startsWithQuery = `${firstWord}%`;
    const likeQuery = `%${firstWord}%`;
    result = (await db.select(
      `SELECT *,
        (CASE
          WHEN content = ? COLLATE NOCASE OR path = ? COLLATE NOCASE THEN 3
          WHEN content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE THEN 2
          WHEN content LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE THEN 1
          ELSE 0
        END) AS relevance
      FROM clipboard_entries
      WHERE ${likeClauses}
      ORDER BY relevance DESC, timestamp DESC
      LIMIT ? OFFSET ?`,
      [
        firstWord,
        firstWord,
        startsWithQuery,
        startsWithQuery,
        likeQuery,
        likeQuery,
        ...likeParams,
      ]
    )) as ClipboardEntry[];
  }
  return result;
}

export async function editClipboardEntry(
  timestamp: number,
  updates: Partial<ClipboardEntry>
): Promise<void> {
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
    values.push(
      Array.isArray(updates.path) ? JSON.stringify(updates.path) : updates.path
    );
  }
  if (updates.html !== undefined) {
    fields.push("html = ?");
    values.push(updates.html);
  }
  if (fields.length === 0) return;
  values.push(timestamp);
  await db.execute(
    `UPDATE clipboard_entries SET ${fields.join(", ")} WHERE timestamp = ?`,
    values
  );
  emit("clipboard-entry-updated");
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
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
  notice: (args: {
    title: string;
    description: string;
    status: "success" | "error";
  }) => void
) {
  if (entry.type === "image" && entry.path) {
    try {
      const normalizedPath = Array.isArray(entry.path)
        ? entry.path[0]
        : entry.path;
      const data = await readFile(normalizedPath, {
        baseDir: BaseDirectory.Picture,
      });
      if (data) {
        const base64 = uint8ArrayToBase64(data);
        await writeImageBase64(base64);
        notice({
          title: "Image copied!",
          description: "Image copied to clipboard",
          status: "success",
        });
      }
    } catch (e) {
      console.error(e);
      notice({
        title: "Failed to copy image",
        description: "Failed to copy image",
        status: "error",
      });
    }
  } else if (entry.type === "html" && entry.html) {
    try {
      await writeHtml(entry.html);
      notice({
        title: "HTML copied!",
        description: "HTML copied to clipboard",
        status: "success",
      });
    } catch (e) {
      console.error("Failed to copy HTML, falling back to text. Error:", e);
      try {
        await writeText(entry.content);
        notice({
          title: "Copied as text",
          description: "HTML copy failed, copied as plain text instead.",
          status: "error",
        });
      } catch (e2) {
        notice({
          title: "Failed to copy",
          description: "Failed to copy HTML and text",
          status: "error",
        });
      }
    }
  } else {
    try {
      await writeText(entry.content);
      notice({
        title: "Copied!",
        description: "Copied to clipboard",
        status: "success",
      });
    } catch (e) {
      notice({
        title: "Failed to copy",
        description: "Failed to copy",
        status: "error",
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
export async function extractTextFromImage(
  imagePathOrBase64: string
): Promise<string> {
  const platform = useOS();
  if (platform === "windows") {
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
