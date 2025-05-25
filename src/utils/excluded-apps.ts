import { emit } from "@tauri-apps/api/event";
import Database from "@tauri-apps/plugin-sql";

export interface ExcludedApp {
  id: string;
  name: string;
  path: string;
  createdAt: number;
  updatedAt: number;
  empty?: boolean;
}

const db = await Database.load("sqlite:clipboard.db");

export async function addExcludedApp(
  app: Omit<ExcludedApp, "id" | "createdAt" | "updatedAt">
): Promise<ExcludedApp> {
  const id = Date.now().toString();

  await db.execute(
    "INSERT INTO excluded_applications (id, name, path) VALUES (?, ?, ?)",
    [id, app.name, app.path]
  );

  // Get the created record with the auto-generated created_at and updated_at
  const result = await getExcludedAppById(id);
  if (!result) {
    throw new Error("Failed to create excluded app");
  }

  emit("excluded-apps-updated");
  return result;
}

export async function deleteExcludedApp(id: string): Promise<void> {
  await db.execute("DELETE FROM excluded_applications WHERE id = ?", [id]);
  emit("excluded-apps-updated");
}

export async function getPaginatedExcludedApps(
  query = "",
  limit = 50,
  offset = 0
): Promise<ExcludedApp[]> {
  let result: ExcludedApp[];
  if (!query) {
    result = (await db.select(
      "SELECT id, name, path, created_at as createdAt, updated_at as updatedAt FROM excluded_applications ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    )) as ExcludedApp[];
  } else {
    // Search in name and path
    const likeQuery = `%${query}%`;
    result = (await db.select(
      `SELECT id, name, path, created_at as createdAt, updated_at as updatedAt,
        (CASE
          WHEN name = ? COLLATE NOCASE OR path = ? COLLATE NOCASE THEN 3
          WHEN name LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE THEN 2
          WHEN name LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE THEN 1
          ELSE 0
        END) AS relevance
      FROM excluded_applications
      WHERE name LIKE ? COLLATE NOCASE OR path LIKE ? COLLATE NOCASE
      ORDER BY relevance DESC, created_at DESC
      LIMIT ? OFFSET ?`,
      [
        query,
        query,
        `${query}%`,
        `${query}%`,
        likeQuery,
        likeQuery,
        likeQuery,
        likeQuery,
        limit,
        offset,
      ]
    )) as ExcludedApp[];
  }

  return result;
}

export async function getAllExcludedApps(): Promise<ExcludedApp[]> {
  const result = (await db.select(
    "SELECT id, name, path, created_at as createdAt, updated_at as updatedAt FROM excluded_applications ORDER BY created_at DESC"
  )) as ExcludedApp[];

  return result;
}

export async function getExcludedAppById(
  id: string
): Promise<ExcludedApp | null> {
  const result = (await db.select(
    "SELECT id, name, path, created_at as createdAt, updated_at as updatedAt FROM excluded_applications WHERE id = ?",
    [id]
  )) as ExcludedApp[];

  return result.length > 0 ? result[0] : null;
}

export async function updateExcludedApp(
  id: string,
  updates: Partial<Pick<ExcludedApp, "name" | "path">>
): Promise<void> {
  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.path !== undefined) {
    fields.push("path = ?");
    values.push(updates.path);
  }

  if (fields.length === 0) return;

  // Always update the updated_at timestamp
  fields.push("updated_at = ?");
  values.push(Date.now());

  values.push(id);
  await db.execute(
    `UPDATE excluded_applications SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  emit("excluded-apps-updated");
}

export async function isAppExcluded(appPath: string): Promise<boolean> {
  const result = (await db.select(
    "SELECT COUNT(*) as count FROM excluded_applications WHERE path = ?",
    [appPath]
  )) as { count: number }[];

  return result.length > 0 && result[0].count > 0;
}
