// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use dirs;
use once_cell::sync::Lazy;
use seekstorm::index::IndexArc;
use seekstorm::{commit::Commit, highlighter::*, index::*, search::*};
use std::env;
use std::path::Path;
use std::sync::Arc;
use tokio::sync::RwLock;

mod clipboard;
pub use clipboard::*;

static CLIPBOARD_INDEX: Lazy<IndexArc> = Lazy::new(|| {
    // Use LOCAL_DATA_DIR if set, otherwise fall back to the user's config directory
    let config_dir = env::var("LOCAL_DATA_DIR").ok().or_else(|| {
        dirs::config_dir().map(|p| p.to_string_lossy().to_string())
    }).expect("Could not determine config directory. Set LOCAL_DATA_DIR or ensure a config directory is available.");
    let bundle_identifier =
        env::var("BUNDLE_IDENTIFIER").unwrap_or_else(|_| "com.clipboard-manager.app".to_string());
    let index_path = Path::new(&config_dir)
        .join(&bundle_identifier)
        .join("clipboard_index");
    let schema_json = r#"[
        {"field":"content","field_type":"Text","stored":true,"indexed":true},
        {"field":"type","field_type":"String","stored":true,"indexed":true},
        {"field":"timestamp","field_type":"Timestamp","stored":true,"indexed":false},
        {"field":"app","field_type":"String","stored":true,"indexed":false},
        {"field":"ocr_text","field_type":"Text","stored":true,"indexed":false},
        {"field":"color","field_type":"String","stored":true,"indexed":false}
    ]"#;
    let schema: Vec<seekstorm::index::SchemaField> = serde_json::from_str(schema_json).unwrap();
    let meta = seekstorm::index::IndexMetaObject {
        id: 0,
        name: "clipboard_index".to_string(),
        similarity: seekstorm::index::SimilarityType::Bm25f,
        tokenizer: seekstorm::index::TokenizerType::AsciiAlphabetic,
        stemmer: seekstorm::index::StemmerType::None,
        stop_words: seekstorm::index::StopwordType::None,
        frequent_words: seekstorm::index::FrequentwordType::English,
        access_type: seekstorm::index::AccessType::Mmap,
    };
    let serialize_schema = true;
    let segment_number_bits1 = 11;
    let index = create_index(
        &index_path,
        meta,
        &schema,
        serialize_schema,
        &Vec::new(),
        segment_number_bits1,
        false,
    )
    .unwrap();
    Arc::new(RwLock::new(index))
});

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize SeekStorm index at startup
    tauri::Builder::default()
        .setup(|_app| Ok(()))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            add_clipboard_entry,
            search_clipboard_entries,
            delete_clipboard_entry
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
