use tauri_plugin_sql::Migration;
use tauri_plugin_sql::MigrationKind;

pub const MIGRATION: Migration = Migration {
    version: 1,
    description: "create clipboard_entries table",
    sql: "
        CREATE TABLE IF NOT EXISTS clipboard_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            type TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            app TEXT,
            path TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_clipboard_timestamp ON clipboard_entries (timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_clipboard_content ON clipboard_entries (content);
        CREATE INDEX IF NOT EXISTS idx_clipboard_path ON clipboard_entries (path);
    ",
    kind: MigrationKind::Up,
};
