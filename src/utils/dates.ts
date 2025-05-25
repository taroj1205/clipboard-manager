import type { ClipboardEntry } from "./clipboard";

export function groupEntriesByDate(
  entries: ClipboardEntry[]
): Record<string, (ClipboardEntry & { count: number })[]> {
  const groups: Record<string, (ClipboardEntry & { count: number })[]> = {};
  // Deduplicate by content+type, keep latest, and count occurrences
  const dedupedMap = new Map<
    string,
    { entry: ClipboardEntry; count: number }
  >();
  for (const entry of entries) {
    const key = `${entry.type}::${entry.content}`;
    const existing = dedupedMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      dedupedMap.set(key, { entry, count: 1 });
    }
  }
  // Only keep the latest entry for each unique content/type
  for (const { entry, count } of dedupedMap.values()) {
    const date = new Date(entry.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday";
    } else {
      groupKey = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push({ ...entry, count });
  }
  // Sort each group by timestamp descending
  for (const key in groups) {
    groups[key].sort((a, b) => b.timestamp - a.timestamp);
  }
  return groups;
}
