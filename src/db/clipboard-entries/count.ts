import { db } from "~/db";

export const getClipboardEntriesCount = async () => {
  const result = (await db.select(
    "SELECT COUNT(*) as count FROM clipboard_entries"
  )) as { count: number }[];

  return result[0]?.count ?? 0;
};
