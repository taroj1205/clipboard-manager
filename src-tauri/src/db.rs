use tauri_plugin_sql::Migration;
use tauri_plugin_sql::MigrationKind;

pub const MIGRATION_1: Migration = Migration {
    version: 1,
    description: "create clipboard_entries table",
    sql: "
        CREATE TABLE IF NOT EXISTS clipboard_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            type TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            app TEXT,
            path TEXT,
            html TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_clipboard_timestamp ON clipboard_entries (timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_clipboard_content ON clipboard_entries (content);
        CREATE INDEX IF NOT EXISTS idx_clipboard_path ON clipboard_entries (path);
        CREATE INDEX IF NOT EXISTS idx_clipboard_html ON clipboard_entries (html);
    ",
    kind: MigrationKind::Up,
};

pub const MIGRATION_2: Migration = Migration {
    version: 2,
    description: "create excluded_applications table",
    sql: "
        CREATE TABLE IF NOT EXISTS excluded_applications (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            added_date TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );
        CREATE INDEX IF NOT EXISTS idx_excluded_apps_name ON excluded_applications (name);
        CREATE INDEX IF NOT EXISTS idx_excluded_apps_path ON excluded_applications (path);
        CREATE INDEX IF NOT EXISTS idx_excluded_apps_created_at ON excluded_applications (created_at DESC);
    ",
    kind: MigrationKind::Up,
};

pub const MIGRATION_3: Migration = Migration {
    version: 3,
    description: "remove redundant added_date column and add updated_at to excluded_applications",
    sql: "
        -- Create new table without added_date column but with updated_at
        CREATE TABLE excluded_applications_new (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
            updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );
        
        -- Copy data from old table (created_at will be preserved, added_date will be dropped, updated_at will be set to created_at)
        INSERT INTO excluded_applications_new (id, name, path, created_at, updated_at)
        SELECT id, name, path, created_at, created_at FROM excluded_applications;
        
        -- Drop old table
        DROP TABLE excluded_applications;
        
        -- Rename new table
        ALTER TABLE excluded_applications_new RENAME TO excluded_applications;
        
        -- Recreate indexes
        CREATE INDEX IF NOT EXISTS idx_excluded_apps_name ON excluded_applications (name);
        CREATE INDEX IF NOT EXISTS idx_excluded_apps_path ON excluded_applications (path);
        CREATE INDEX IF NOT EXISTS idx_excluded_apps_created_at ON excluded_applications (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_excluded_apps_updated_at ON excluded_applications (updated_at DESC);
    ",
    kind: MigrationKind::Up,
};
