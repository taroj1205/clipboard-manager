import type { ClipboardEntry } from "./clipboard";

const getDedupKey = (entry: ClipboardEntry): string =>
  entry.app === "Smart Search"
    ? `${entry.type}::${entry.content}::${entry.timestamp}`
    : `${entry.type}::${entry.content}`;

const getGroupKey = (
  entry: ClipboardEntry,
  today: Date,
  yesterday: Date
): string => {
  if (entry.app === "Smart Search") {
    return "Smart Result";
  }

  const date = new Date(entry.timestamp);
  const dateString = date.toDateString();
  if (dateString === today.toDateString()) {
    return "Today";
  }
  if (dateString === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    weekday: "long",
    year: "numeric",
    month: "long",
  });
};

export function groupEntriesByDate(entries: ClipboardEntry[]): {
  [key: string]: (ClipboardEntry & { count: number })[];
} {
  const groups: { [key: string]: (ClipboardEntry & { count: number })[] } = {};
  const dedupedMap = new Map<
    string,
    { entry: ClipboardEntry; count: number }
  >();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const entry of entries) {
    const key = getDedupKey(entry);
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

  for (const { entry, count } of dedupedMap.values()) {
    const groupKey = getGroupKey(entry, today, yesterday);
    groups[groupKey] ??= [];
    groups[groupKey].push({ ...entry, count });
  }

  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => b.timestamp - a.timestamp);
  }
  return groups;
}
