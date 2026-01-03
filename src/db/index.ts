import Database from "@tauri-apps/plugin-sql";

const databaseUrl = import.meta.env.DEV
  ? "sqlite:clipboard.dev.db"
  : "sqlite:clipboard.db";

export const db = await Database.load(databaseUrl);
