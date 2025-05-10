use seekstorm::index::DeleteDocuments;
use seekstorm::index::Document;
use seekstorm::index::FileType;
use seekstorm::index::IndexDocuments;
use seekstorm::search::Search;
use seekstorm::search::{QueryType, ResultType};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::collections::HashSet;

// Reuse the static index from lib.rs
use crate::CLIPBOARD_INDEX;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ClipboardEntry {
    pub content: String,
    pub r#type: String,
    pub timestamp: i64,
    pub app: Option<String>,
    pub ocr_text: Option<String>,
    pub color: Option<String>,
}

#[tauri::command]
pub async fn add_clipboard_entry(entry: ClipboardEntry) -> Result<(), String> {
    // Build document as HashMap<String, Value>
    let mut doc = HashMap::new();
    doc.insert("content".to_string(), Value::String(entry.content));
    doc.insert("type".to_string(), Value::String(entry.r#type));
    doc.insert("timestamp".to_string(), Value::from(entry.timestamp));
    if let Some(app) = entry.app {
        doc.insert("app".to_string(), Value::String(app));
    }
    if let Some(ocr) = entry.ocr_text {
        doc.insert("ocr_text".to_string(), Value::String(ocr));
    }
    if let Some(color) = entry.color {
        doc.insert("color".to_string(), Value::String(color));
    }
    let document: Document = doc.into();
    crate::CLIPBOARD_INDEX.index_documents(vec![document]).await;
    Ok(())
}

#[tauri::command]
pub async fn search_clipboard_entries(
    query: String,
    limit: usize,
) -> Result<Vec<ClipboardEntry>, String> {
    let result = crate::CLIPBOARD_INDEX
        .search(
            query,
            QueryType::Intersection,
            0,
            limit as usize,
            ResultType::TopkCount,
            false,
            vec![],
            vec![], // query_facets
            vec![], // facet_filter
            vec![], // result_sort
        )
        .await;
    let index_guard = crate::CLIPBOARD_INDEX.read().await;
    let index = &*index_guard;
    let mut entries = Vec::new();
    for hit in result.results.iter() {
        let doc = index
            .get_document(hit.doc_id, false, &None, &HashSet::new(), &[])
            .unwrap();
        let entry = ClipboardEntry {
            content: doc
                .get("content")
                .and_then(|v| v.as_str().map(|s| s.to_string()))
                .unwrap_or_default(),
            r#type: doc
                .get("type")
                .and_then(|v| v.as_str().map(|s| s.to_string()))
                .unwrap_or_default(),
            timestamp: doc
                .get("timestamp")
                .and_then(|v| v.as_i64())
                .unwrap_or_default(),
            app: doc
                .get("app")
                .and_then(|v| v.as_str().map(|s| s.to_string())),
            ocr_text: doc
                .get("ocr_text")
                .and_then(|v| v.as_str().map(|s| s.to_string())),
            color: doc
                .get("color")
                .and_then(|v| v.as_str().map(|s| s.to_string())),
        };
        entries.push(entry);
    }
    Ok(entries)
}

#[tauri::command]
pub async fn delete_clipboard_entry(doc_id: u64) -> Result<(), String> {
    crate::CLIPBOARD_INDEX.delete_documents(vec![doc_id]).await;
    Ok(())
}
