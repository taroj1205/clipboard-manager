import type { ClipboardEntry } from "./clipboard";

export function groupEntriesByDate(entries: ClipboardEntry[]): {
  [key: string]: (ClipboardEntry & { count: number })[];
} {
  const groups: { [key: string]: (ClipboardEntry & { count: number })[] } = {};
  // Deduplicate by content+type, keep latest, and count occurrences
  const dedupedMap = new Map<
    string,
    { entry: ClipboardEntry; count: number }
  >();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const entry of entries) {
    const key = `${entry.type}::${entry.content}`;
    const existing = dedupedMap.get(key);
    if (existing) {
      if (entry.timestamp > existing.entry.timestamp) {
        dedupedMap.set(key, { entry, count: existing.count + 1 });
      } else {
        existing.count++;
      }
    } else {
      dedupedMap.set(key, { entry, count: 1 });
    }
  }
  // Only keep the latest entry for each unique content/type
  for (const { entry, count } of dedupedMap.values()) {
    const date = new Date(entry.timestamp);
    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday";
    } else {
      groupKey = date.toLocaleDateString("en-US", {
        day: "numeric",
        weekday: "long",
        year: "numeric",
        month: "long",
      });
    }
    groups[groupKey] ??= [];
    groups[groupKey].push({ ...entry, count });
  }
  // Sort each group by timestamp descending
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => b.timestamp - a.timestamp);
  }
  return groups;
}
